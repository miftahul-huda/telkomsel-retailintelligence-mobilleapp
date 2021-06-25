import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class UploadedFile extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
              filename: Sequelize.TEXT,
              upload_date: Sequelize.STRING,
              picture_taken_date: Sequelize.STRING,
              picture_taken_by: Sequelize.STRING,
              uploaded_by_email: Sequelize.STRING,
              uploaded_by_fullname: Sequelize.STRING,
              uploaded_filename: Sequelize.STRING,
              uploaded_id: Sequelize.DECIMAL,

              lon: Sequelize.DECIMAL,
              lat: Sequelize.DECIMAL,
              alt: Sequelize.DECIMAL,
              store_id: Sequelize.STRING,
              store_name: Sequelize.STRING,

              exposure_time: Sequelize.DECIMAL,
              iso_speed_rating: Sequelize.DECIMAL,
              white_balance: Sequelize.DECIMAL,
              orientation: Sequelize.DECIMAL,
              flash: Sequelize.DECIMAL,
              fnumber: Sequelize.DECIMAL,

              pixel_width: Sequelize.DECIMAL,
              pixel_height: Sequelize.DECIMAL,
              dpi_weight: Sequelize.DECIMAL,
              dpi_height: Sequelize.DECIMAL,
              exif_image_width: Sequelize.DECIMAL,
              exit_image_height: Sequelize.DECIMAL,
              exif_version: Sequelize.DECIMAL,
              exif_offset: Sequelize.DECIMAL,
              make:   Sequelize.STRING,
              model: Sequelize.STRING,
              x_resolution: Sequelize.DECIMAL,
              y_resolution: Sequelize.DECIMAL,
              operator: Sequelize.STRING,
              suboperator: Sequelize.STRING,
              isuploaded: Sequelize.INTEGER,

              isPoster: Sequelize.INTEGER,
              posterType: Sequelize.STRING,
              areaPromotion: Sequelize.STRING,
              imageCategory: Sequelize.STRING,
              operatorDominant: Sequelize.STRING
            
            },
            {
              sequelize,
              modelName: "UploadedFile",
              tableName: "UploadedFile",
              timestamps: false,
              force: force
            }
          );

          return o;
    }

}
