import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class TotalSales extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
              kartuPerdana: Sequelize.STRING,
              voucherFisik: Sequelize.STRING,
              isiUlang: Sequelize.STRING,
              paketPalingBanyakDibeli: Sequelize.STRING,
              upload_file_id: Sequelize.INTEGER
            
            },
            {
              sequelize,
              modelName: "TotalSales",
              tableName: "TotalSales",
              timestamps: false,
              force: force
            }
          );
          return o;
    }

}
