import { r, R, RPoolConnectionOptions, WriteResult } from "rethinkdb-ts";

export default class DatabaseHandler {
  public r: R;

  public constructor() {
    this.r = r;
  }

  public async init(): Promise<void> {
    const connectSettings: RPoolConnectionOptions = {
      server: { host: "db", port: 28015 },
      db: process.env.DB_NAME
    };
    
    let poolMaster = await this.r.connectPool(connectSettings);
    await poolMaster.waitForHealthy();

    // Check if the DB hasn't been initialised
    const dbList = await this.r.dbList().run();
    if (!dbList.includes(process.env.DB_NAME)) {
      await r.dbCreate(process.env.DB_NAME).run();
      await r.db(process.env.DB_NAME).tableCreate("activities").run();

      await poolMaster.drain();

      poolMaster = await this.r.connectPool(connectSettings);
      await poolMaster.waitForHealthy();
    }

    return;
  }

  public async disconnect(): Promise<void> {
    await this.r.getPoolMaster().drain();
  }

  public get(table: string, key?: string): Promise<any> {
    return key
      ? this.r.table(table).get(key).run()
      : this.r.table(table).run();
  }

  public async has(table: string, key: string): Promise<boolean> {
    const matching = await this.get(table, key);
    
    return !!matching;
  }

  public insert(table: string, data: any): Promise<WriteResult<any>> {
    return this.r.table(table).insert(data).run();
  }

  public update(table: string, key: string, data: any): Promise<WriteResult<any>> {
    return this.r.table(table).get(key).update(data).run();
  }

  public delete(table: string, key: string): Promise<WriteResult<any>> {
    return this.r.table(table).get(key).delete().run();
  }

  public deleteAll(table: string): Promise<WriteResult<any>> {
    return this.r.table(table).delete().run();
  }

  public filterGet(table: string, data: any): Promise<any[]> {
    return this.r.table(table).filter(data).run();
  }
}