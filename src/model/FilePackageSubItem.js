import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class FilePackageSubItem extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
                subItemCategory: Sequelize.STRING,
                subItemCategoryId: Sequelize.STRING,
                quotaType: Sequelize.STRING,
                quotaTypeId: Sequelize.STRING,
                appType: Sequelize.STRING,
                appName: Sequelize.STRING,
                quota: Sequelize.DECIMAL,
                quotaCategory: Sequelize.STRING,
                fup: Sequelize.DECIMAL,
                quotaValidity: Sequelize.DECIMAL,
                validityType: Sequelize.STRING,
                quotaUsage: Sequelize.STRING,
                additionalNote: Sequelize.STRING,
                packageItemId: Sequelize.INTEGER
            
            },
            {
              sequelize,
              modelName: "FilePackageSubItem",
              tableName: "FilePackageSubItem",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}
