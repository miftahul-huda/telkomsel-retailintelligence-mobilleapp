import * as SQLite from "expo-sqlite";
import { SwitchRouter } from "react-navigation";
import Sequelize from "rn-sequelize";
const Op = Sequelize.Op;
const Model = Sequelize.Model;

export default class TotalSales extends Model {
    static async initialize(sequelize, force=false) {
        let o = await super.init(
            {
              operator: Sequelize.STRING,
              isiUlang: Sequelize.STRING,
              paketPalingBanyakDibeli: Sequelize.STRING,
              paketPalingBanyakDibeliNama: Sequelize.STRING,
              paketPalingBanyakDibeliBesaran: Sequelize.STRING,
              upload_file_id: Sequelize.INTEGER,
              totalRataPenjualan: Sequelize.STRING,
              totalPenjualanPerdana: Sequelize.STRING,
              totalPenjualanVoucherFisik: Sequelize.STRING,
              totalPenjualanKartuPerdanaMicro: Sequelize.STRING,
              totalPenjualanKartuPerdanaLow: Sequelize.STRING,
              totalPenjualanKartuPerdanaMid: Sequelize.STRING,
              totalPenjualanKartuPerdanaHigh: Sequelize.STRING,
              totalPenjualanVoucherFisikMicro: Sequelize.STRING,
              totalPenjualanVoucherFisikLow: Sequelize.STRING,
              totalPenjualanVoucherFisikMid: Sequelize.STRING,
              totalPenjualanVoucherFisikHigh: Sequelize.STRING
            
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
