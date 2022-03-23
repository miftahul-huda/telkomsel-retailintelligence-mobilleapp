import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class FilePackageItem extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
                package_name:  Sequelize.STRING,
                upload_file_id: Sequelize.INTEGER,
                price: Sequelize.DECIMAL,
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
                category: Sequelize.STRING,
                campaignTheme: Sequelize.STRING,
                itemCategory: Sequelize.STRING,
                itemCategoryText: Sequelize.STRING,
                tempid: Sequelize.STRING,
                subitempackage: Sequelize.STRING,
                subitempackageitems: Sequelize.STRING,

                imageStatus: Sequelize.STRING,
            },
            {
              sequelize,
              modelName: "FilePackageItem",
              tableName: "FilePackageItem",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}
