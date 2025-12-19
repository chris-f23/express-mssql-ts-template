import mssql from "mssql";
import { generate as generateId } from "shortid";
import { StoredProcedureDefinition } from "./stored-procedure-definition";
import { IParameters, IParsedResult } from "./index";

export class TransactionContext {
  transaction: mssql.Transaction;
  state: "idle" | "started" | "committed" | "rolledback" = "idle";
  id: string;
  // executionStack?

  constructor() {
    this.id = generateId();
    this.transaction = new mssql.Transaction();
  }

  async begin() {
    if (this.state !== "idle") {
      throw new Error("Transaction already started");
    }
    this.transaction = await this.transaction.begin();
    this.state = "started";
    // console.debug(`[${this.id}] Transaction started`);
  }

  async commit() {
    if (this.state !== "started") {
      throw new Error("Transaction not started");
    }
    await this.transaction.commit();
    this.state = "committed";
    // console.debug(`[${this.id}] Transaction committed`);
  }

  async rollback() {
    if (this.state !== "started") {
      throw new Error("Transaction not started");
    }
    await this.transaction.rollback();
    this.state = "rolledback";
    // console.debug(`[${this.id}] Transaction rolled back`);
  }

  async execute<
    TParameters extends IParameters,
    TParsedResult extends IParsedResult
  >(
    storedProcedure: StoredProcedureDefinition<TParameters, TParsedResult>,
    parameters: TParameters
  ) {
    const storedProcedureFullName = `${storedProcedure.options.databaseName}.${storedProcedure.options.schemaName}.${storedProcedure.options.storedProcedureName}`;
    if (this.transaction === undefined) {
      throw new Error("No transaction");
    }

    const request = this.transaction.request();
    // request.verbose = true;

    for (const parameter of Object.entries(parameters)) {
      request.input(parameter[0], parameter[1]);
    }

    console.debug(
      `[${this.id}] EXEC ${storedProcedureFullName} ${JSON.stringify(
        parameters
      )}`
    );

    const rawResult = await request.execute(storedProcedureFullName);

    const parsedResult = storedProcedure.options.parseResult(rawResult);
    return parsedResult;
  }
}
