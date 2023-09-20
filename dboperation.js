var config = require("./dbconfig"); //require() dùng để tải file hoặc gói
const sql = require("mssql"); //tải module mssql
const bcrypt = require("bcrypt"); // dùng để mã hoá mật khẩu
const nodemailer = require('nodemailer');//dùng để gửi email
require('dotenv').config(); // đọc biến môi trường
//const { format } = require('date-fns'); //ép định dạng cho ngày tháng năm
//const argon2 = require('argon2');
//const bcrypt = require('bcryptjs');
//const crypto = require('crypto');

//xử lý tải dữ liệu xe
async function layuser() {
  try {
    let pool = await sql.connect(config);
    let res = await pool.request().query("SELECT * FROM users");
    return res.recordset;
  } catch (error) {
    console.log("Lỗi Tải Dữ Liệu User :" + error);
  } finally {
    sql.close();
  }
}

// Hàm đăng ký
async function dangKy(data) {
  try {
    let pool = await sql.connect(config);
    // Mã hóa mật khẩu
    //const hashedPassword = hashPassword(data.Pass);
    const hashedPassword = await bcrypt.hash(data.Pass, 10);
    let res = await pool
      .request()
      .input("HoTen", sql.NVarChar, data.HoTen)
      .input("UserName", sql.VarChar, data.UserName)
      .input("Pass", sql.NVarChar, hashedPassword) // Truyền mật khẩu đã được mã hóa
      .execute("dangky");
    return res.recordsets;
  } catch (error) {
    console.log("Lỗi khi đăng ký: " + error);
  } finally {
    sql.close();
  }
}

// Hàm đăng nhập
async function dangNhap(data, res) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .query("SELECT * FROM users WHERE UserName = '" + data.UserName + "'");

    if (result !== undefined && result.recordset.length > 0) {
      let matchedUser;
      for (const user of result.recordset) {
        const isPasswordMatch = await bcrypt.compare(data.Pass, user.Pass);
        if (isPasswordMatch) {
          matchedUser = user;
          break;
        }
      }
      if (matchedUser) {
        console.log("matchedUser: ", matchedUser);
        const userID = matchedUser.IDUsers; // Lấy ID từ người dùng khớp
        // Đăng nhập thành công
        const currentTime = Date.now().toString();
        const secret = "apple4car"; // Thay đổi chuỗi bí mật thành giá trị thực tế
        const sessionID = bcrypt.hashSync(currentTime + secret, 10);
        //thêm 3 ngày thời hạn
        const currentTime2 = Date.now();
        const threeDaysLater = new Date(currentTime2 + (3 * 24 * 60 * 60 * 1000));
        await sql.query`UPDATE users SET SessionID = ${sessionID}, TimeSession = ${threeDaysLater} WHERE IDUsers = ${userID}`;
        //res.cookie('ss', sessionID, { maxAge: 3600000, httpOnly: true });
        //res.cookie('ss2', 'aaaa', { maxAge: oneDay, httpOnly: true, secure: false });
        return {
          success: true,
          message: "Đăng nhập thành công!",
          cookieValue: sessionID,
        };
      } else {
        // Mật khẩu không khớp
        return {
          success: false,
          message: "Tài khoản hoặc mật khẩu không chính xác!",
        };
      }
    } else {
      // Người dùng không tồn tại
      return {
        success: false,
        message: "Tài khoản hoặc mật khẩu không chính xác!",
      };
    }
  } catch (error) {
    console.error("Đã xảy ra lỗi trong quá trình đăng nhập: ", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi trong quá trình đăng nhập!",
    };
  } finally {
    sql.close();
  }
}

//hàm lấy thông tin từ sessionID
async function SessionID(sessionID) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("SessionID", sql.NVarChar, sessionID.sessionID)
      .query(
        "SELECT IDUsers, HoTen, UserName, Quyen, TimeSession FROM users WHERE SessionID = @SessionID"
      );

    if (result.recordset.length === 0) {
      return { success: false, message: "Bạn hãy đăng nhập lại!" };
    }

    const timeSession = result.recordset[0].TimeSession;
    const currentTime = new Date();

    if (currentTime > timeSession) {
      return { success: false, message: "Bạn hãy đăng nhập lại!" };
    }

    return result.recordset;
  } catch (error) {
    console.log("Lỗi khi kiểm tra SessionID: " + error);
  } finally {
    sql.close();
  }
}

//todo: lấy thông tin xe
async function layxe() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT * FROM xe");
    return result.recordset;
  } catch (error) {
    console.log("Lỗi Tải Dữ Liệu Xe: " + error);
  } finally {
    sql.close();
  }
}
//todo: Thêm thông tin xe
async function themxe(MaXe, TenXe, MaLoaiXe, BienSo, GhiChu, Anh) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("MaXe", sql.Int, MaXe)
      .input("TenXe", sql.NVarChar, TenXe)
      .input("MaLoaiXe", sql.Int, MaLoaiXe)
      .input("BienSo", sql.VarChar, BienSo)
      .input("GhiChu", sql.NVarChar, GhiChu)
      .input("Anh", sql.NVarChar, Anh)
      .execute("themxe");
    return result.recordsets;
  } catch (error) {
    console.log("Lỗi khi thêm thông tin xe: " + error);
  }
}
//todo: sửa thông tin xe
async function suaxe(MaXe, TenXe, MaLoaiXe, BienSo, GhiChu, Anh) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("MaXe", sql.Int, MaXe)
      .input("TenXe", sql.NVarChar, TenXe)
      .input("MaLoaiXe", sql.Int, MaLoaiXe)
      .input("BienSo", sql.VarChar, BienSo)
      .input("GhiChu", sql.NVarChar, GhiChu)
      .input("Anh", sql.NVarChar, Anh)
      .execute("suaxe");
    return result.recordsets;
  } catch (error) {
    console.log("Lỗi khi sửa thông tin xe: " + error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi sửa thông tin xe", error });
  }
}
//todo: Xóa thông tin xe
async function xoaxe(MaXe) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("MaXe", sql.Int, MaXe)
      .execute("xoaxe");
    return result;
  } catch (error) {
    console.log("Lỗi khi xóa thông tin xe: " + error);
    throw error;
  }
}

//hàm thêm, sửa ảnh xe
async function themSuaAnhXe(MaXe, DuongDanAnh) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("MaXe", sql.Int, MaXe)
      .input("Anh", sql.VarChar, DuongDanAnh)
      .query(
        "UPDATE XE SET Anh = @Anh WHERE MaXe = @MaXe"
      );
    return result;
  } catch (error) {
    console.log("Lỗi khi thêm ảnh xe: " + error);
    throw error;
  }
}

//hàm xoá user
async function xoauser(IDUsers) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("IDUsers", sql.Int, IDUsers)
      .query("DELETE FROM users WHERE IDUsers = @IDUsers");

    if (result.rowsAffected[0] === 0) {
      throw new Error("Không tìm thấy người dùng để xoá");
    }

    return result;
  } catch (error) {
    console.log("Lỗi khi xóa thông tin user: " + error);
    throw error;
  }
}

async function suaThongTinUser(IDUsers, HoTen, Quyen, UserName) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("IDUsers", sql.Int, IDUsers)
      .input("HoTen", sql.NVarChar, HoTen)
      .input("Quyen", sql.NChar, Quyen)
      .input("UserName", sql.VarChar, UserName)
      .query("UPDATE users SET HoTen = @HoTen, Quyen = @Quyen, UserName = @UserName WHERE IDUsers = @IDUsers");
    return result;
  } catch (error) {
    console.log("Lỗi khi sửa thông tin user: " + error);
    throw error;
  } finally {
    sql.close();
  }
}

// cấu hình email
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dangtuanthanh265@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Sử dụng biến môi trường EMAIL_PASSWORD
  }
});
// Hàm gửi thông tin của người dùng
async function thongtin(data) {
  try {
    let pool = await sql.connect(config);
    let mailOptions = {
      from: 'dangtuanthanh265@gmail.com',
      to: 'cuathanhday265@gmail.com',
      subject: 'Thông báo về việc có đơn thuê xe mới',
      text: `Chào bạn. Đã có đơn hàng mới. 
      Thông tin đơn hàng: 
      Họ Tên: ${data.HoTen}, 
      Email: ${data.Email},
      ...
      Hãy truy cập trang quản trị để xem thông tin chi tiết. `
    };
    let res = await pool
      .request()
      .input("HoTen", sql.NVarChar, data.HoTen)
      .input("Email", sql.VarChar, data.Email)
      .input("DiemNhan", sql.NVarChar, data.DiemNhan)
      .input("NgayNhan", sql.DateTime, data.NgayNhan)
      .input("DiemTra", sql.NVarChar, data.DiemTra)
      .input("NgayTra", sql.DateTime, data.NgayTra)
      .execute("ThemThongTin");
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        throw error;
      } else {
        console.log('Email đã được gửi: ' + info.response);
      }
    });
    return res;
  } catch (error) {
    console.log("Lỗi khi sửa thông tin user: " + error);
    throw error;
  } finally {
    sql.close();
  }
}
// Hàm xuất thông tin theo idid
async function contact(idContact) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("idContact", sql.Int, idContact)
      .query(
        "SELECT [HoTen], [Email], [DiemNhan], [NgayNhan], [DiemTra], [NgayTra] FROM [dbo].[ThongTin] WHERE [ID] = @idContact"
      );

    return result.recordset;
  } catch (error) {
    console.log("Lỗi Tải Dữ Liệu Contact: " + error);
    throw error;
  } finally {
    sql.close();
  }
}
// Hàm xuất thông tin liên hệ
async function getcontact() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT * FROM Thongtin");
    return result.recordset;
  } catch (error) {
    console.log("Lỗi Tải Dữ Liệu Xe: " + error);
  } finally {
    sql.close();
  }
}
// Hàm tính toán giá thuê xe dựa trên số ngày thuê
// Hàm xử lý lấy giá thuê xe dựa trên số ngày thuê và mã loại xe
async function getgia(numberOfDays, maLoaiXe) {
  try {
    // Kết nối cơ sở dữ liệu
    await sql.connect(config);

    // Truy vấn giá thuê xe dựa trên số ngày thuê và mã loại xe
    const query = `
      SELECT Gia
      FROM DICHVU
      WHERE NgayThue <= GETDATE() AND MaLoaiXe = @MaLoaiXe
      ORDER BY NgayThue DESC
    `;

    const request = new sql.Request();
    request.input('MaLoaiXe', sql.Int, maLoaiXe);

    const result = await request.query(query);

    // Tính giá thuê dựa trên số ngày thuê
    const gia = result.recordset[0].Gia * numberOfDays;
    return gia;
  } catch (err) {
    console.log('Lỗi truy vấn cơ sở dữ liệu:', err);
    throw new Error('Lỗi truy vấn cơ sở dữ liệu');
  }
}

//todo Hàm xử lý riêng để lấy thông tin xe và giá dịch vụ
async function getThongTinXe() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query("SELECT XE.*, DICHVU.Gia   FROM XE INNER JOIN DICHVU ON XE.MaLoaiXe = DICHVU.MaLoaiXe");
    return result.recordset;
  } catch (error) {
    console.log("Lỗi Tải Dữ Liệu Xe: " + error);
  } finally {
    sql.close();
  }
}


module.exports = {
  layxe: layxe,
  layuser: layuser,
  dangKy: dangKy,
  dangNhap: dangNhap,
  SessionID: SessionID,
  suaxe: suaxe,
  themxe: themxe,
  xoaxe: xoaxe,
  themSuaAnhXe: themSuaAnhXe,
  xoauser: xoauser,
  suaThongTinUser: suaThongTinUser,
  thongtin:thongtin,
  contact: contact,
  getgia: getgia,
  getcontact:getcontact,
  getThongTinXe:getThongTinXe,
};
