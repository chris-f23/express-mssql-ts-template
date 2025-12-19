import { Request, RequestHandler } from "express";
import { TransactionContext } from "./transaction-context";

type IRawRequest = Partial<
  Pick<Request, "body" | "headers" | "params" | "query"> & {
    payload: {
      usuario: string;
    };
  }
>;
type IParsedRequest = Record<string, any>;

type IReponseBodyData = Record<string, any> | Record<string, any>[];

// type IResponse<TBodyData extends IReponseBodyData> = {
//   status: number;
//   body: {
//     data: TBodyData;
//     meta?: Record<string, any>;
//   };
// };

type DbTransaction = {
  id: string;
  execute: TransactionContext["execute"];
};

type IControllerOptions<
  TRawRequest extends IRawRequest,
  TParsedRequest extends IParsedRequest,
  TResponseBodyData extends IReponseBodyData
> = {
  parseRequest: (rawRequest: TRawRequest) => TParsedRequest;
  process: (
    parsedRequest: TParsedRequest,
    dbTransaction: DbTransaction
  ) => Promise<TResponseBodyData>;
};

export class JSONController<
  TRawRequest extends IRawRequest,
  TParsedRequest extends IParsedRequest,
  TResponseBodyData extends IReponseBodyData
> {
  constructor(
    public readonly options: IControllerOptions<
      TRawRequest,
      TParsedRequest,
      TResponseBodyData
    >
  ) {}

  async handleRequest(
    rawRequest: TRawRequest,
    tranContext: TransactionContext
  ) {
    const parsedRequest = this.options.parseRequest(rawRequest);

    try {
      const dbTransaction = {
        id: tranContext.id,
        transaction: tranContext.transaction,
        execute: tranContext.execute,
      };

      const output = await this.options.process(parsedRequest, dbTransaction);

      return output;
    } catch (error) {
      throw error;
    }
  }

  handle: RequestHandler = async (req, res, next) => {
    const tranContext = new TransactionContext();

    try {
      await tranContext.begin();
      const output = await this.handleRequest(
        {
          // @ts-ignore
          payload: req.payload,
          body: req.body,
          headers: req.headers,
          params: req.params,
          query: req.query,
        } as TRawRequest,
        tranContext
      );

      await tranContext.commit();

      res.json(output);
    } catch (error) {
      await tranContext.rollback();
      next(error);
    }
  };
}
