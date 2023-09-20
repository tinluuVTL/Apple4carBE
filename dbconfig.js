//connect sử dụng  windows Authentication
// const config = {
//     server: "THANHMIXED\\SQLEXPRESS",
//     database: "HoaDon",
//     options: {
//       trustedconnection: true,
//       enableArithAbort: true,
//       authentication: {
//         type: "ActiveDirectoryIntegrated"
//       }
//     }
//   };


// const config = {
//   user: "admin",
//   password: "12345",
//   server: "THANHMIXED",
//   database: "QLThueXE",
//   options: {
//     trustedconnection: true,
//     trustServerCertificate: true,
//     enableArithAbort: true,
//     instancename: "",
//   },
//   port: 2651,
//   //tìm port bằng cách truy cập sql server configuration manager trong máy -> sql server network configuration -> Protocols for SQLEXPRESS -> Enabled phần TCP/IP ->TCP/IP -> IP Adress-> IPAll ->lấy thông số TCP Dynamic Port
// };

const config = {
  user: "tuanthanh_apple4car",
  password: "12345",
  server: "sql.bsite.net\\MSSQL2016",
  database: "tuanthanh_apple4car",
  options: {
    trustedconnection: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    instancename: "",
  },
  port: 2651
   //tìm port bằng cách truy cập sql server configuration manager trong máy -> sql server network configuration -> Protocols for SQLEXPRESS -> Enabled phần TCP/IP ->TCP/IP -> IP Adress-> IPAll ->lấy thông số TCP Dynamic Port
};

module.exports = config;
