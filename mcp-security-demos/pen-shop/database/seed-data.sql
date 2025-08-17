-- Seed data for demo
INSERT INTO categories (name, description) VALUES
('luxury', 'Premium luxury writing instruments'),
('premium', 'High-quality professional pens'),
('everyday', 'Reliable daily writing tools');

INSERT INTO pens (name, brand, category_id, price, description, in_stock) VALUES
('Meisterstück 149', 'Montblanc', 1, 745.00, 'Premium fountain pen with 14k gold nib', true),
('Duofold Centennial', 'Parker', 1, 425.00, 'Classic design with modern engineering', true),
('Custom 823', 'Pilot', 2, 275.00, 'Vacuum filler with exceptional ink capacity', false),
('Metropolitan', 'Pilot', 3, 15.00, 'Affordable quality for daily use', true),
('Urban', 'Parker', 2, 45.00, 'Modern professional style', true);

-- Vulnerable customer data (for demonstration)
INSERT INTO customers (name, email, phone, address, credit_card) VALUES
('John Doe', 'john@example.com', '555-0123', '123 Main St, Anytown', '4532-1234-5678-9012'),
('Jane Smith', 'jane@company.com', '555-0456', '456 Oak Ave, Somewhere', '5678-9012-3456-7890'),
('Bob Johnson', 'bob@email.com', '555-0789', '789 Pine Rd, Nowhere', '9012-3456-7890-1234'),
('Alice Brown', 'alice@test.com', '555-0321', '321 Elm St, Anywhere', '3456-7890-1234-5678');

-- Admin credentials (intentionally insecure)
INSERT INTO admin_users (username, password, role, api_key) VALUES
('admin', 'admin123', 'super_admin', 'sk-admin-key-12345'),
('manager', 'password', 'manager', 'sk-manager-key-67890'),
('support', 'support123', 'support', 'sk-support-key-abcde');

-- Sample orders
INSERT INTO orders (customer_id, pen_id, quantity, total_amount, status) VALUES
(1, 1, 1, 745.00, 'completed'),
(2, 2, 2, 850.00, 'pending'),
(3, 4, 3, 45.00, 'shipped'),
(4, 5, 1, 45.00, 'completed');
