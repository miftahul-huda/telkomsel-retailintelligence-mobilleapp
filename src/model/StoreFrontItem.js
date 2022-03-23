import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class StoreFrontItem extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
                operator:  Sequelize.STRING,
                operatorText:  Sequelize.STRING,
                percentage: Sequelize.DECIMAL,
                productHero: Sequelize.STRING,
                gbmain: Sequelize.DECIMAL,
                gbmain_duration_days: Sequelize.INTEGER,
                gbnight: Sequelize.DECIMAL,
                gb4glte: Sequelize.DECIMAL,
                gb3g2g: Sequelize.DECIMAL,
                gblocal: Sequelize.DECIMAL,
                gbnational: Sequelize.DECIMAL,
                gbinclvoice: Sequelize.DECIMAL,
                gbincludetext: Sequelize.DECIMAL,
                gbapps: Sequelize.DECIMAL,
                validity: Sequelize.DECIMAL,
                transferPrice: Sequelize.DECIMAL,
                price: Sequelize.DECIMAL,
                category: Sequelize.STRING,
                campaignTheme: Sequelize.STRING,
                upload_file_id: Sequelize.INTEGER,

                imageStatus: Sequelize.STRING,
            
            },
            {
              sequelize,
              modelName: "StoreFrontItem",
              tableName: "StoreFrontItem",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}
