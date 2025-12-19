import { IParameters, IParsedResult, IRawResult } from ".";

type StoredProcedureOptions<
  TParameters extends IParameters,
  TParsedResult extends IParsedResult
> = {
  databaseName: string;
  schemaName?: string;
  storedProcedureName: string;
  parseResult: (raw: IRawResult) => TParsedResult;
};

export class StoredProcedureDefinition<
  TParameters extends IParameters,
  TParsedResult extends IParsedResult
> {
  constructor(
    public readonly options: StoredProcedureOptions<TParameters, TParsedResult>
  ) {}
}
