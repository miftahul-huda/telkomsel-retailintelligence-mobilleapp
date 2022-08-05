import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class EtalaseItem extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
              operator:  Sequelize.STRING,
              operatorText: Sequelize.STRING,
              percentage: Sequelize.DECIMAL,
              upload_file_id: Sequelize.INTEGER,
              isTransfered: Sequelize.INTEGER,
              availability_score: Sequelize.INTEGER,
              visibility_score: Sequelize.INTEGER,
              visibility_percentage: Sequelize.DECIMAL,
              originalOperator:  Sequelize.STRING,
              originalOperatorText: Sequelize.STRING,
              original_availability_percentage: Sequelize.DECIMAL,
              original_visibility_percentage: Sequelize.DECIMAL,
              original_availability_score: Sequelize.DECIMAL,
              original_visibility_score: Sequelize.DECIMAL,
            
            },
            {
              sequelize,
              modelName: "EtalaseItem",
              tableName: "EtalaseItem",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}
