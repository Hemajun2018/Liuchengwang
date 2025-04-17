-- 插入管理员账号
-- 密码哈希值对应原始密码，请根据实际情况调整
-- 从 liuchengwang.sql 提取
INSERT INTO `user` (`id`, `username`, `password`, `role`, `real_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`)
VALUES 
(1, 'admin', '$2b$10$HKri4R8s4HjgFn8C2fnL.ecNIjCUegSkQOum7Y9vvA0eJvn8WOzDy', 'super_admin', '管理员', NULL, NULL, NULL, '2025-03-14 20:40:16.193891', '2025-03-21 11:36:18.000000')
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role = VALUES(role),
  real_name = VALUES(real_name),
  email = VALUES(email),
  phone = VALUES(phone),
  avatar = VALUES(avatar),
  updated_at = VALUES(updated_at); 