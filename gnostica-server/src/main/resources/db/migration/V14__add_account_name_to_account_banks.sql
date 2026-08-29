-- Thêm cột name (tên chủ tài khoản ngân hàng) vào bảng account_banks.
-- Cột này lưu tên tài khoản sau khi xác minh qua BankLookup khi người dùng
-- bấm "Lưu tài khoản" ở form thiết lập tài khoản ngân hàng.
ALTER TABLE account_banks ADD COLUMN name VARCHAR(255);
