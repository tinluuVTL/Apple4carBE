var express = require("express");
const cors = require("cors"); //xử lý chính sách CORS
var router = express.Router();
const sql = require("../dboperation"); //load file dboperation
const bodyParser = require("body-parser"); //phương thức POST
//const bcrypt = require("bcrypt"); //dùng để tạo phiên đăng nhập
const multer = require('multer');//xử lý lưu ảnh
const path = require('path');//xử lý thêm phần mở rộng cho ảnh

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "APPLE4CAR" });
});

//Lấy dữ liệu user
router.get("/layuser", function (req, res, next) {
  sql.layuser().then((result) => {
    res.json(result);
  });
});
//todo Lấy dữ liệu xe

router.get("/layxe", function (req, res, next) {
  sql.layxe().then((result) => {
    res.json(result);
  });
});
//Đăng ký hệ thống
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post("/dangky", function (req, res, next) {
  // Lấy dữ liệu được gửi đến từ client
  console.log(req.body);
  const data = req.body;
  // Thực hiện thêm dữ liệu vào SQL
  sql
    .dangKy(data)
    .then((result) => {
      //return { success: true, message: 'Đăng nhập thành công!' };
      res.status(200).json({ success: true, message: "Đăng ký thành công!" });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: "Lỗi đăng ký", error });
    });
});

//đăng nhập

router.post("/dangnhap", function (req, res, next) {
  // Lấy dữ liệu được gửi đến từ client
  const data = req.body;
  // Thực hiện thêm dữ liệu vào SQL
  sql
    .dangNhap(data, res)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: "Đã xảy ra lỗi khi đăng nhập:  ", error });
    });
});

//kiểm tra phiên làm việc:
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.post("/sessionID", function (req, res, next) {
  // Lấy dữ liệu được gửi đến từ client
  const data = req.body;
  // Thực hiện thêm dữ liệu vào SQL
  sql
    .SessionID(data)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: "Đã xảy ra lỗi khi đăng nhập:  ", error });
    });
});

//*quản lý xe

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
//! Thêm thông tin xe
router.post("/themxe", function (req, res, next) {
  const { MaXe, TenXe, MaLoaiXe, BienSo, GhiChu, Anh } = req.body;
  sql
    .themxe(MaXe, TenXe, MaLoaiXe, BienSo, GhiChu, Anh)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Thêm thông tin xe thành công" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Lỗi thêm thông tin xe", error });
    });
});
//* Sửa thông tin xe
router.put("/suaxe/:MaXe", function (req, res, next) {
  const MaXe = parseInt(req.params.MaXe);

  const { TenXe, MaLoaiXe, BienSo, GhiChu, Anh } = req.body;

  sql
    .suaxe(MaXe, TenXe, MaLoaiXe, BienSo, GhiChu, Anh)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Sửa thông tin xe thành công" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Lỗi sửa thông tin xe", error });
    });
});

//? Xóa thông tin xe
router.delete("/xoaxe/:MaXe", function (req, res, next) {
  const MaXe = parseInt(req.params.MaXe);
  sql
    .xoaxe(MaXe)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Xóa thông tin xe thành công" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Lỗi xóa thông tin xe", error });
    });
});

// Upload ảnh xe
router.use(express.static(path.join(__dirname, 'public')));//thiết lập cho phép truy cập file static
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploadAnhXe/'); // Thư mục lưu trữ file
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Lấy phần mở rộng của file
    cb(null, file.fieldname + '-' + Date.now() + ext); // Đổi tên file và thêm phần mở rộng
  }
});

const newupload = multer({ storage: storage });
router.post('/uploadAnhXe/:MaXe', newupload.single('image'), (req, res) => {
  const MaXe = req.params.MaXe;
  const imagePath = req.file.path;
  //const domain = 'http://localhost:3000';
  const domain = 'http://' + req.hostname
  const newPath = path.relative('public', imagePath);
  const imagePathWithDomain = path.join(domain,newPath);

  sql
    .themSuaAnhXe(MaXe,imagePathWithDomain)
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Cập nhật ảnh xe thành công" });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ success: false, message: "Lỗi khi Cập nhật ảnh xe", error });
    });
  
});

//sửa user
router.put("/suauser/:IDUsers", async function (req, res, next) {
  const IDUsers = parseInt(req.params.IDUsers);
  const { HoTen, Quyen, UserName } = req.body;

  try {
    const result = await sql.suaThongTinUser(IDUsers, HoTen, Quyen, UserName);
    res.status(200).json({ success: true, message: "Sửa thông tin user thành công" });
  } catch (error) {
    console.log("Lỗi khi sửa thông tin user: " + error);
    res.status(500).json({ success: false, message: "Lỗi sửa thông tin user", error });
  }
});

//Xoá user
router.delete("/xoauser/:IDUsers", async function (req, res, next) {
  const IDUsers = parseInt(req.params.IDUsers);
  try {
    await sql.xoauser(IDUsers);
    res.status(200).json({ success: true, message: "Xóa thông tin user thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi xóa thông tin user", error });
  }
});

//Lấy thông tin người dùng từ form
//Đăng ký hệ thống
router.post("/thongtin", function (req, res, next) {
  console.log(req.body);
  const data = req.body;
  // Thực hiện thêm dữ liệu vào SQL
  sql
    .thongtin(data)
    .then((result) => {
      res.status(200).json({ success: true, message: "Gửi thông tin thành công!" });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: "Lỗi khi gửi thông tin", error });
    });
});
//todo: lấy dữ liệu thông tin liên hệ 
router.get("/getcontact", function (req, res, next) {
  sql.getcontact().then((result) => {
    res.json(result);
  });
});
//todo Đường dẫn api trả thông tin xe
router.get("/thongtinxe", function (req, res, next) {
  sql.getThongTinXe().then((result) => {
    res.json(result);
  });
});

//todo Xuất thông tin theo id
router.get("/contact/:id", function (req, res, next) {
  const idContact = req.params.id; // Lấy id contact từ tham số đường dẫn

  sql
    .contact(idContact)
    .then((result) => {
      if (result.length > 0) {
        res.json(result[0]); // Chỉ xuất ra dữ liệu của phần tử đầu tiên trong kết quả
      } else {
        res
          .status(404)
          .json({ error: "Không tìm thấy thông tin liên hệ với id " + idContact });
      }
    })
    .catch((error) => {
      console.log("Lỗi Tải Dữ Liệu Contact: " + error);
      res.status(500).json({ error: "Lỗi Tải Dữ Liệu Contact" });
    });
});
//todo: api xử lý giá tự động tăng theo ngày
router.get('/gia/:numberOfDays/:maLoaiXe', async (req, res) => {
  const numberOfDays = parseInt(req.params.numberOfDays);
  const maLoaiXe = parseInt(req.params.maLoaiXe);

  try {
    // Gọi hàm xử lý lấy giá thuê xe
    const gia = await sql.getgia(numberOfDays, maLoaiXe);

    // Định dạng giá thuê là "VND"
    const giaFormatted = gia.toLocaleString('en-US', { style: 'currency', currency: 'VND' });

    // Trả về giá thuê
    res.json({ gia: giaFormatted });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
