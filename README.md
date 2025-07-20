# 🗂️ Proje Kart Paneli – Admin Dashboard

Hoş geldin! Bu proje, modern ve sade bir admin panel tasarımıyla projeleri kart şeklinde listelemenizi ve yönetmenizi sağlayan web tabanlı bir uygulamadır.  
Projeleri kolayca **ekleyebilir**, **düzenleyebilir**, **silebilir** ve görsel olarak şık bir şekilde listeleyebilirsiniz.  

---

## ✨ Özellikler

🎴 Projeler şık Bootstrap kartlarıyla listelenir  
➕ Yeni proje ekleme (başlık, açıklama, tarih, resimler vs.)  
📝 Proje düzenleme (form üzerinden)  
❌ Proje silme (onaylı)  
📁 Veriler JSON dosyasından ya da veritabanından (isteğe bağlı) alınabilir  
⚡ Dinamik sayfa geçişleri ve sayfa yenilemeden işlem desteği  
🎨 Bootstrap 5 ile responsive tasarım  
🗃️ Kolay yönetim için sade arayüz

---

## 📁 Klasör Yapısı
admin-panel/
├── public/ # Statik dosyalar
│ ├── img/ # Kart görselleri
│ ├── style.css
│ └── script.js
│ └── all-min.css
├── views/ # EJS sayfaları
│ ├── goster.ejs # Kartların listelendiği ana sayfa
│ ├── ekle.ejs # Proje ekleme formu
│ └── duzenle.ejs # Proje düzenleme formu
├── api/
│ └── data.json # Proje verilerinin tutulduğu dosya
├── server.js # Node.js sunucu dosyası
