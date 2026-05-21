# Hướng dẫn Push code lên GitHub

## 🚀 Cách 1: Sử dụng GitHub CLI (Khuyến nghị - Tự động)

### Bước 1: Cài đặt GitHub CLI

**Windows (sử dụng winget):**
```powershell
winget install --id GitHub.cli
```

**Hoặc tải về từ:** https://cli.github.com/

### Bước 2: Đăng nhập GitHub
```bash
gh auth login
```

Chọn:
- GitHub.com
- HTTPS
- Authenticate with your browser

### Bước 3: Tạo repository và push tự động
```bash
cd "C:\Users\ducvu\water-pollution-gis"

# Tạo repository public
gh repo create water-pollution-gis --public --source=. --remote=origin --push

# Hoặc tạo repository private
gh repo create water-pollution-gis --private --source=. --remote=origin --push
```

✅ **XONG!** Repository đã được tạo và code đã được push.

---

## 🌐 Cách 2: Tạo thủ công trên GitHub Web

### Bước 1: Tạo repository trên GitHub
1. Truy cập: https://github.com/new
2. Repository name: `water-pollution-gis`
3. Chọn Public hoặc Private
4. **KHÔNG** chọn "Add README" (vì đã có sẵn)
5. Click "Create repository"

### Bước 2: Thêm remote và push
```bash
cd "C:\Users\ducvu\water-pollution-gis"

# Thêm remote origin (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/water-pollution-gis.git

# Push code lên GitHub
git push -u origin master
```

### Bước 3: Nhập thông tin đăng nhập
- Username: `your-github-username`
- Password: **Sử dụng Personal Access Token** (không phải mật khẩu)

**Tạo Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Chọn scopes: `repo` (full control)
4. Copy token và sử dụng làm password

---

## 🔐 Cách 3: Sử dụng SSH (Bảo mật hơn)

### Bước 1: Tạo SSH key (nếu chưa có)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Nhấn Enter để chấp nhận vị trí mặc định.

### Bước 2: Thêm SSH key vào GitHub
```bash
# Copy nội dung public key
cat ~/.ssh/id_ed25519.pub
```

1. Truy cập: GitHub → Settings → SSH and GPG keys → New SSH key
2. Paste nội dung key vào
3. Click "Add SSH key"

### Bước 3: Push với SSH
```bash
cd "C:\Users\ducvu\water-pollution-gis"

# Tạo repo trên GitHub web trước, sau đó:
git remote add origin git@github.com:YOUR_USERNAME/water-pollution-gis.git
git push -u origin master
```

---

## 📝 Kiểm tra kết quả

Sau khi push thành công:
```bash
git remote -v
# Sẽ hiển thị origin với URL của repository

git log
# Xem commit history
```

Truy cập repository trên GitHub:
`https://github.com/YOUR_USERNAME/water-pollution-gis`

---

## 🆘 Xử lý lỗi thường gặp

### Lỗi: "remote origin already exists"
```bash
git remote remove origin
git remote add origin <URL>
```

### Lỗi: "Support for password authentication was removed"
→ Sử dụng Personal Access Token thay vì mật khẩu

### Lỗi: "Permission denied (publickey)"
→ Kiểm tra SSH key đã được thêm vào GitHub chưa

---

## ✅ Checklist

- [ ] GitHub CLI đã cài đặt (hoặc tạo repo thủ công)
- [ ] Đã đăng nhập GitHub
- [ ] Repository đã được tạo
- [ ] Remote origin đã được thêm
- [ ] Code đã được push thành công
- [ ] Kiểm tra trên GitHub web

---

**🎉 Sau khi hoàn thành, repository của bạn sẽ có:**
- 85 files
- Tài liệu đầy đủ bằng tiếng Việt
- Backend + Frontend + Admin app hoàn chỉnh
- 9,802 dòng code
