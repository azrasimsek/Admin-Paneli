const express = require("express");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");  // mysql2 kütüphanesini dahil et
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 0;  // İlk olarak 3000'yi dener, ama doluysa başka portlar da denenebilir  

// Statik dosyalar (CSS ve JS)
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));
app.use('/img', express.static(path.join(__dirname, 'public/img')));


// EJS'yi ayarla
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MySQL bağlantı yapılandırması
const db = mysql.createConnection({
  host: 'localhost',  // MySQL sunucusunun adresi
  user: 'root',       // MySQL kullanıcı adı
  password: '',       // MySQL şifresi
  database: 'AdminPanelDB',  // Bağlanılacak veritabanı adı
});

// MySQL bağlantısını başlatma
db.connect((err) => {
  if (err) {
    console.error('MySQL bağlantı hatası:', err);
    return;
  }
  console.log('MySQL sunucusuna bağlanıldı');
  
  // Sunucuyu başlatma
  const server = app.listen(PORT, () => {
    console.log(`Sunucu ${server.address().port} portunda çalışıyor`);
  });
});

// 📌 Fotoğraf yükleme ayarları (public/img klasörüne kaydedilecek)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "public/img/");
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

 //📌 Proje ekleme işlemi
 app.post("/addProject", (req, res) => {
  const filePath = path.join(__dirname, "api", "data.json");
  let projectsData = [];

  // Eğer `data.json` varsa içeriği oku
  if (fs.existsSync(filePath)) {
      projectsData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // 🎯 1. Resimleri UUID ile kaydet
  let uploadedImages = [];
  if (req.files && req.files.projeResmi) {
      // Eğer birden fazla resim varsa, dizi olarak işlem yap
      const images = Array.isArray(req.files.projeResmi) ? req.files.projeResmi : [req.files.projeResmi];

      images.forEach(file => {
          const uniqueID = uuidv4();
          const ext = path.extname(file.name); // Dosya uzantısı
          const newFileName = `${uniqueID}${ext}`;
          const uploadPath = path.join(__dirname, "public", "img", newFileName);

          // Dosyayı kaydet
          file.mv(uploadPath, err => {
              if (err) console.log("Dosya yüklenirken hata oluştu:", err);
          });

          uploadedImages.push("/img/" + newFileName);
      });
  }

  // 🎯 2. Yeni proje oluştur
  const newProject = {
      id: projectsData.length + 1,
      projeAdi: req.body.projeAdi,
      projeSayisi: req.body.projeSayisi,
      projeAciklamasi: req.body.projeAciklamasi,
      baslangicTarihi: req.body.baslangicTarihi,
      tamamlanmaOrani: `%${req.body.tamamlanmaOrani}`,
      projeResmi: uploadedImages.join(",") // Resim yollarını JSON formatında sakla
  };

  // 🎯 3. `data.json` dosyasına ekle
  projectsData.push(newProject);
  fs.writeFileSync(filePath, JSON.stringify(projectsData, null, 2));

  res.redirect("/projeler"); // 📌 Proje başarıyla eklenince sayfaya yönlendir
});
// app.post("/addProject",upload.array("projeResmi", 10), (req, res) => {
  
//   const filePath = path.join(__dirname, "api", "data.json");
//   let projectsData = [];

//   // Eğer `data.json` varsa içeriği oku
//   if (fs.existsSync(filePath)) {
//       projectsData = JSON.parse(fs.readFileSync(filePath, "utf8"));
//   }

//   // Yeni proje oluştur
//   const newProject = {
//       id: projectsData.length + 1,
//       projeAdi: req.body.projeAdi,
//       projeSayisi: req.body.projeSayisi,
//       projeAciklamasi: req.body.projeAciklamasi,
//       baslangicTarihi: req.body.baslangicTarihi,
//       tamamlanmaOrani: `%${req.body.tamamlanmaOrani}`,
//       projeResmi: req.files.map(file => "/img/" + file.filename).join(",")
//   };

//   projectsData.push(newProject);
//   fs.writeFileSync(filePath, JSON.stringify(projectsData, null, 2));

//   res.redirect("/projeler");  // 📌 Proje başarıyla eklenince sayfaya yönlendir
// });



// API Route: JSON dosyasını oku ve API olarak sun
app.get("/api/projeler", (req, res) => {
  const filePath = path.join(__dirname, "api", "data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
          console.error("Dosya okuma hatası:", err);
          res.status(500).json({ error: "Veri okunamadı" });
          return;
      }
      res.json(JSON.parse(data));
  });
});



app.get('/port', (req, res) => {
  res.json({ port });
});

// Örnek veri sorgulama
app.get('/data', (req, res) => {
  db.query('SELECT * FROM kullanici', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Veri alınırken bir hata oluştu');
      return;
    }
    res.json(results);
  });
});

app.get('/ping', (req, res) => {
  res.send('API çalışıyor!');
});

// Ana Sayfa
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/index", (req, res) => {
  res.render("index");
});

//Login
app.get("/login", (req, res) => {
  res.render("login"); // "views/login.ejs" dosyasını aç
});

app.post("/login", (req, res) => {
  const { mail, sifre } = req.body;
  const sql = "SELECT * FROM kullanici WHERE mail = ?";
  
  db.query(sql, [mail], async (err, results) => {
      if (err) throw err;
      
      if (results.length > 0) {
          const kullanici = results[0];

          // Şifreyi karşılaştır
          const isMatch = await bcrypt.compare(sifre, kullanici.sifre);

          if (isMatch) {
              req.session.kullanici = { id: kullanici.id, rol: kullanici.rol }; // Kullanıcıyı session'a kaydet

              // Kullanıcı rolüne göre yönlendir
              if (kullanici.rol === "admin") {
                  res.redirect("/admin");
              } else {
                  res.redirect("/dashboard");
              }
          } else {
              res.send("Yanlış şifre!");
          }
      } else {
          res.send("Kullanıcı bulunamadı!");
      }
  });
});

//Hesap Oluşturma Sayfası
app.get("/hesapOlustur", (req, res) => {
  res.render("hesapOlustur"); // "views/login.ejs" dosyasını aç
});

app.post("/hesapOlustur", (req, res) => {
  const { mail, isim, sifre } = req.body;
  
  // Aynı mail veya kullanıcı adı var mı kontrol et
  const sql = "SELECT * FROM kullanici WHERE mail = ? OR isim = ?";
  
  db.query(sql, [mail, isim], (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
          return res.send("Bu e-posta veya kullanıcı adı zaten kullanılıyor!");
      }

      // Kullanıcıyı veritabanına kaydet
      const insertSql = "INSERT INTO kullanici (mail, isim, sifre, rol) VALUES (?, ?, ?, 'uye')";
      
      db.query(insertSql, [mail, isim, sifre], (err, result) => {
          if (err) throw err;

          res.redirect("/login"); // Kayıt sonrası giriş sayfasına yönlendir
      });
  });
});

//Sifre Unuttum Page 
app.get("/sifreUnuttum", (req, res) => {
  res.render("sifreUnuttum");
});

//Proje Ekle Page 
app.get("/projeEkle", (req, res) => {
  res.render("projeEkle");
});

//Proje GÖster Page 
// app.get("/projeler", (req, res) => {
//   const filePath = path.join(__dirname, "api", "data.json");
//     let projectsData = [];

//     if (fs.existsSync(filePath)) {
//         projectsData = JSON.parse(fs.readFileSync(filePath, "utf8"));
//     }

//     res.render("projeler", { projects: projectsData });
// });
app.get("/projeler", (req, res) => {
  fs.readFile("./api/data.json", "utf8", (err, data) => {
      if (err) throw err;
      let projeler = JSON.parse(data);
      res.render("projeler", { projeler }); // 'projeler.ejs' şablonuna projeler listesini gönderiyoruz
  });
});


//Proje Düzenle Page 
app.get("/projeDuzenle", (req, res) => {
  const id = req.query.id;
  console.log("Gelen ID:", id); // Gelen ID'yi terminalde kontrol et

  fs.readFile("./api/data.json", "utf8", (err, data) => {
      if (err) throw err;
      let projeler = JSON.parse(data);

      console.log("Projeler JSON Verisi:", projeler); // JSON içeriğini gör

      let seciliProje = projeler.find(p => p.id == id);
      console.log("Bulunan Proje:", seciliProje); // Eşleşme olup olmadığını gör

      if (!seciliProje) {
          return res.status(404).send("Proje bulunamadı!");
      }

      res.render("projeDuzenle", { proje: seciliProje });
  });
});


// Resim yükleme ayarları
app.post("/updateProject", (req, res) => {
  const { id, projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani } = req.body;
  const filePath = "./api/data.json";

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Dosya okuma hatası:", err);
      return res.status(500).send("Sunucu hatası");
    }

    let projeler = JSON.parse(data);
    let index = projeler.findIndex(p => p.id == id);

    if (index === -1) {
      return res.status(404).send("Proje bulunamadı.");
    }

    // Mevcut resimleri al
    let mevcutResimler = projeler[index].projeResmi ? projeler[index].projeResmi.split(',').map(img => img.trim()) : [];

    // Yeni yüklenen resimleri işle
    let yeniResimler = [];
    if (req.files && req.files.projeResmi) {
      const images = Array.isArray(req.files.projeResmi) ? req.files.projeResmi : [req.files.projeResmi];

      let uploadPromises = images.map(file => {
        return new Promise((resolve, reject) => {
          const uniqueID = uuidv4();
          const ext = path.extname(file.name);
          const newFileName = `${uniqueID}${ext}`;
          const uploadPath = path.join(__dirname, "public", "img", newFileName);

          file.mv(uploadPath, err => {
            if (err) {
              console.error("Dosya yüklenirken hata oluştu:", err);
              reject(err);
            } else {
              resolve("/img/" + newFileName);
            }
          });
        });
      });

      Promise.all(uploadPromises)
        .then(uploadedImages => {
          let guncellenmisResimler = [...mevcutResimler, ...uploadedImages].join(', ');

          // Proje bilgilerini güncelle
          projeler[index] = {
            ...projeler[index],
            projeAdi,
            projeSayisi,
            projeAciklamasi,
            baslangicTarihi,
            tamamlanmaOrani: tamamlanmaOrani.replace("%", ""),
            projeResmi: guncellenmisResimler
          };

          // JSON dosyasını güncelle
          fs.writeFile(filePath, JSON.stringify(projeler, null, 4), (err) => {
            if (err) {
              console.error("Dosya yazma hatası:", err);
              return res.status(500).send("Veri güncellenirken hata oluştu.");
            }
            res.redirect("/projeler");
          });
        })
        .catch(err => {
          res.status(500).send("Resimler yüklenirken hata oluştu.");
        });
    } else {
      // Eğer yeni resim yüklenmemişse direkt güncelle
      projeler[index] = {
        ...projeler[index],
        projeAdi,
        projeSayisi,
        projeAciklamasi,
        baslangicTarihi,
        tamamlanmaOrani: tamamlanmaOrani.replace("%", "")
      };

      fs.writeFile(filePath, JSON.stringify(projeler, null, 4), (err) => {
        if (err) {
          console.error("Dosya yazma hatası:", err);
          return res.status(500).send("Veri güncellenirken hata oluştu.");
        }
        res.redirect("/projeler");
      });
    }
  });
});
// app.post("/updateProject", upload.array("projeResmi", 10), (req, res) => {
//   const { id, projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani } = req.body;
  
//   // Yeni yüklenen tüm resimlerin yollarını al
//   const yeniResimler = req.files.map(file => "/img/" + file.filename); 

//   fs.readFile("./api/data.json", "utf8", (err, data) => {
//     if (err) throw err;
//     let projeler = JSON.parse(data);

//     let index = projeler.findIndex(p => p.id == id);
//     if (index !== -1) {
//       // Mevcut resimleri al, eğer varsa
//       let mevcutResimler = projeler[index].projeResmi ? projeler[index].projeResmi.split(',').map(img => img.trim()) : [];
//       // Yeni resimleri mevcut resimlerin sonuna ekle
//       let guncellenmisResimler = [...mevcutResimler, ...yeniResimler].join(', ');

//       // Proje bilgilerini güncelle
//       projeler[index] = {
//         ...projeler[index],
//         projeAdi,
//         projeSayisi,
//         projeAciklamasi,
//         baslangicTarihi,
//         tamamlanmaOrani: tamamlanmaOrani.replace("%", ""),
//         projeResmi: guncellenmisResimler // Yeni ve eski resimleri birleştir
//       };

//       // Güncellenmiş projeleri JSON dosyasına kaydet
//       fs.writeFile("./api/data.json", JSON.stringify(projeler, null, 4), (err) => {
//         if (err) throw err;

//         // Güncellenen projeyle birlikte resimleri frontend'e gönder
//         let proje = projeler[index];
//         let resimler = proje.projeResmi.split(',').map(img => img.trim());

//         // EJS şablonuna projeyle birlikte resimleri de gönder
//         res.render('projeler', { proje, resimler });
//       });
//     }
//   });
// });


//Proje Sil 
app.get("/projeSil", (req, res) => {
  const projeId = req.query.id;

  if (!projeId) {
      return res.status(400).send("Proje ID belirtilmedi.");
  }

  // JSON dosyasını oku
  fs.readFile("api/data.json", "utf8", (err, data) => {
      if (err) {
          return res.status(500).send("Veri okunamadı.");
      }

      let projeler = JSON.parse(data);
      
      // Projeyi id'ye göre filtreleyerek sil
      projeler = projeler.filter(proje => proje.id !== parseInt(projeId));

      // Güncellenmiş JSON'u tekrar dosyaya yaz
      fs.writeFile("api/data.json", JSON.stringify(projeler, null, 4), (err) => {
          if (err) {
              return res.status(500).send("Proje silinirken hata oluştu.");
          }
          res.redirect("/projeler"); // Projeler sayfasına geri dön
      });
  });
});

//Proje Düzenle Page 
app.get("/ayarlar", (req, res) => {
  res.render("ayarlar");
});

//deneme proje gösterme sayfası
app.get('/goster', (req, res) => {
  const sql = `
      SELECT projeler.*, 
             GROUP_CONCAT(proje_resimler.resim_yolu) AS resimler
      FROM projeler
      LEFT JOIN proje_resimler ON projeler.id = proje_resimler.proje_id
      GROUP BY projeler.id`;

  db.query(sql, (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Projeler yüklenirken hata oluştu.");
      }

      const projeler = results.map(proje => ({
          ...proje,
          resimler: proje.resimler ? proje.resimler.split(",") : []
      }));

      res.render('goster', { projeler });
  });
});

//deneme proje ekleme sayfası 
app.get("/ekle", (req, res) => {
  res.render("ekle");
});

app.post('/ekle', (req, res) => {
  const { projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani } = req.body;
  
  if (!projeAdi || !baslangicTarihi || !tamamlanmaOrani) {
      return res.status(400).send("Lütfen gerekli tüm alanları doldurun.");
  }

  // Yeni proje ekle
  const sql = "INSERT INTO projeler (projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send("Proje eklenirken hata oluştu.");
      }

      const projeId = result.insertId;
      console.log("Yeni proje eklendi, ID:", projeId);
      
      // Eğer resimler varsa işle
      if (req.files && req.files.resimler) {
          const images = Array.isArray(req.files.resimler) ? req.files.resimler : [req.files.resimler];
          const resimEkleSql = "INSERT INTO proje_resimler (proje_id, resim_yolu) VALUES ?";
          
          const resimVerileri = images.map(file => {
              const ext = path.extname(file.name);
              const yeniDosyaAdi = `${uuidv4()}${ext}`;
              const kayitYolu = path.join(__dirname, "public", "img", yeniDosyaAdi);
              const dbYolu =  yeniDosyaAdi;

              file.mv(kayitYolu, err => {
                  if (err) console.error("Dosya yüklenirken hata oluştu:", err);
              });
              
              console.log("Kaydedilen resim:", dbYolu);
              return [projeId, yeniDosyaAdi];
          });

          console.log("SQL'e eklenecek resim verileri:", resimVerileri);
          db.query(resimEkleSql, [resimVerileri], (err) => {
              if (err) {
                  console.error("Resimler eklenirken hata oluştu:", err);
                  return res.status(500).send("Resimler eklenirken hata oluştu.");
              }
              console.log("Resimler başarıyla SQL'e eklendi.");
              res.redirect('/goster');
          });
      } else {
          res.redirect('/goster');
      }
  });
});


// duzenle sayfası
app.get('/duzenle/:id', (req, res) => {
  const projeId = req.params.id;

  // Projeyi ve resimlerini çekiyoruz
  const sql = `
      SELECT projeler.*, 
             GROUP_CONCAT(proje_resimler.resim_yolu) AS resimler 
      FROM projeler
      LEFT JOIN proje_resimler ON projeler.id = proje_resimler.proje_id
      WHERE projeler.id = ?
      GROUP BY projeler.id
  `;

  db.query(sql, [projeId], (err, results) => {
      if (err) {
          console.error("Proje çekme hatası:", err);
          return res.status(500).send("Veritabanı hatası");
      }

      if (results.length === 0) {
          return res.status(404).send("Proje bulunamadı.");
      }

      // Resimleri diziye çevirelim (virgülle ayrılmış olabilir)
      let proje = results[0];
      proje.resimler = proje.resimler ? proje.resimler.split(",") : [];

      // EJS sayfasına projeyi ve resimleri gönderelim
      res.render('duzenle', { proje });
  });
});

app.post('/duzenle/:id', (req, res) => {
  const projeId = req.params.id;
  const { projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani } = req.body;

  // 1️⃣ Proje bilgilerini güncelle
  const sqlProjeGuncelle = `
      UPDATE projeler 
      SET projeAdi = ?, projeSayisi = ?, projeAciklamasi = ?, baslangicTarihi = ?, tamamlanmaOrani = ?
      WHERE id = ?`;
  const paramsProje = [projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani, projeId];

  db.query(sqlProjeGuncelle, paramsProje, (err) => {
      if (err) {
          console.error("Proje güncelleme hatası:", err);
          return res.status(500).send("Veritabanı hatası");
      }

      // 2️⃣ Eğer yeni resimler yüklendiyse bunları kaydet
      if (req.files && req.files.projeResimler) {
          const projeResimler = req.files.projeResimler;
          const imgPath = path.join(__dirname, "public", "img");

          // Klasör yoksa oluştur
          if (!fs.existsSync(imgPath)) {
              fs.mkdirSync(imgPath, { recursive: true });
          }

          const sqlResimEkle = `INSERT INTO proje_resimler (proje_id, resim_yolu) VALUES ?`;
          const resimValues = [];

          if (Array.isArray(projeResimler)) {
              // Birden fazla dosya yüklendiyse
              projeResimler.forEach(file => {
                  const yeniResimAdi = uuidv4() + path.extname(file.name);
                  const tamResimYolu = path.join(imgPath, yeniResimAdi);

                  // Resmi kaydet
                  file.mv(tamResimYolu, (err) => {
                      if (err) {
                          console.error("Resim kaydetme hatası:", err);
                          return res.status(500).send("Resim kaydedilemedi.");
                      }
                  });

                  resimValues.push([projeId, yeniResimAdi]); // Veritabanına sadece dosya adını kaydet
              });
          } else {
              // Tek bir dosya yüklendiyse
              const yeniResimAdi = uuidv4() + path.extname(projeResimler.name);
              const tamResimYolu = path.join(imgPath, yeniResimAdi);

              // Resmi kaydet
              projeResimler.mv(tamResimYolu, (err) => {
                  if (err) {
                      console.error("Resim kaydetme hatası:", err);
                      return res.status(500).send("Resim kaydedilemedi.");
                  }
              });

              resimValues.push([projeId, yeniResimAdi]);
          }

          // Resim bilgilerini veritabanına ekle
          db.query(sqlResimEkle, [resimValues], (err) => {
              if (err) {
                  console.error("Resim ekleme hatası:", err);
                  return res.status(500).send("Resim ekleme başarısız oldu.");
              }
              res.redirect('/goster');
          });
      } else {
          res.redirect('/goster');
      }
  });
});

// app.post('/duzenle/:id', upload.array('projeResimler', 10), (req, res) => {
//   const projeId = req.params.id;
//   const { projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani } = req.body;

//   // 1️⃣ Önce proje bilgilerini güncelle
//   const sqlProjeGuncelle = `
//       UPDATE projeler 
//       SET projeAdi = ?, projeSayisi = ?, projeAciklamasi = ?, baslangicTarihi = ?, tamamlanmaOrani = ?
//       WHERE id = ?`;
//   const paramsProje = [projeAdi, projeSayisi, projeAciklamasi, baslangicTarihi, tamamlanmaOrani, projeId];

//   db.query(sqlProjeGuncelle, paramsProje, (err) => {
//       if (err) {
//           console.error("Proje güncelleme hatası:", err);
//           return res.status(500).send("Veritabanı hatası");
//       }

//       // 2️⃣ Eğer yeni resimler yüklendiyse bunları kaydet
//       if (req.files && req.files.length > 0) {
//           const sqlResimEkle = `
//               INSERT INTO proje_resimler (proje_id, resim_yolu)
//               VALUES ?`;

//           const resimValues = req.files.map(file => [projeId, file.filename]);

//           db.query(sqlResimEkle, [resimValues], (err) => {
//               if (err) {
//                   console.error("Resim ekleme hatası:", err);
//                   return res.status(500).send("Resim ekleme başarısız oldu.");
//               }
//               res.redirect('/goster');
//           });
//       } else {
//           res.redirect('/goster');
//       }
//   });
// });

// deneme sil sayfası
// Projeyi silme
app.get('/sil/:id', (req, res) => {
  const projeId = req.params.id;

  // 1️⃣ Önce ilgili resimlerin yolunu al
  const getImagesQuery = 'SELECT resim_yolu FROM proje_resimler WHERE proje_id = ?';

  db.query(getImagesQuery, [projeId], (err, results) => {
      if (err) {
          console.error("Resimleri alma hatası:", err);
          return res.status(500).send("Resimleri alırken hata oluştu.");
      }

      // 2️⃣ Resim dosyalarını 'public/img/' klasöründen sil
      results.forEach(row => {
          const resimYolu = path.join(__dirname, "public", "img", row.resim_yolu);
          if (fs.existsSync(resimYolu)) {
              fs.unlink(resimYolu, (err) => {
                  if (err) console.error("Dosya silme hatası:", err);
              });
          }
      });

      // 3️⃣ Önce proje_resimler tablosundaki ilgili kayıtları sil
      const deleteImagesQuery = 'DELETE FROM proje_resimler WHERE proje_id = ?';

      db.query(deleteImagesQuery, [projeId], (err) => {
          if (err) {
              console.error("Resim tablosu silme hatası:", err);
              return res.status(500).send("Resim kayıtları silinemedi.");
          }

          // 4️⃣ Ardından projeler tablosundan projeyi sil
          const deleteProjectQuery = 'DELETE FROM projeler WHERE id = ?';

          db.query(deleteProjectQuery, [projeId], (err) => {
              if (err) {
                  console.error("Proje silme hatası:", err);
                  return res.status(500).send("Proje silinemedi.");
              }
              res.redirect('/goster'); // Silme işleminden sonra yönlendirme
          });
      });
  });
});

app.delete('/resim-sil/:resimYolu', (req, res) => {
  const resimYolu = req.params.resimYolu;
  const projeId = req.body.projeId; // Eğer gerekirse projeId de alabilirsin

  // 1️⃣ Dosya yolunu belirle
  const dosyaTamYolu = path.join(__dirname, "public", "img", resimYolu);

  // 2️⃣ Dosyayı img klasöründen sil
  if (fs.existsSync(dosyaTamYolu)) {
      fs.unlink(dosyaTamYolu, (err) => {
          if (err) {
              console.error("Dosya silme hatası:", err);
              return res.status(500).json({ success: false, message: "Dosya silinemedi." });
          }

          // 3️⃣ Veritabanından ilgili kaydı sil
          const sqlSil = "DELETE FROM proje_resimler WHERE resim_yolu = ?";
          db.query(sqlSil, [resimYolu], (err, result) => {
              if (err) {
                  console.error("Veritabanı silme hatası:", err);
                  return res.status(500).json({ success: false, message: "Veritabanından silinemedi." });
              }
              res.json({ success: true });
          });
      });
  } else {
      res.status(404).json({ success: false, message: "Dosya bulunamadı." });
  }
});

// Sunucuyu Başlat
app.listen(3000, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
