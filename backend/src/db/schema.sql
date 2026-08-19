-- ============================================================
-- Grand Luxe Hotel Management System — PostgreSQL Schema
-- Run this file once to create all tables.
-- ============================================================

-- USERS (Staff accounts)
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(100) PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'receptionist',
  phone         VARCHAR(50),
  status        VARCHAR(50)  NOT NULL DEFAULT 'active',
  avatar        TEXT,
  last_active   TIMESTAMPTZ  DEFAULT NOW(),
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ROOMS (Hotel inventory)
CREATE TABLE IF NOT EXISTS rooms (
  id          VARCHAR(100) PRIMARY KEY,
  room_number VARCHAR(20)   NOT NULL,
  floor       INTEGER       NOT NULL DEFAULT 1,
  type        VARCHAR(100)  NOT NULL,
  name        VARCHAR(255),
  bed_type    VARCHAR(150),
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity    INTEGER       NOT NULL DEFAULT 2,
  amenities   JSONB         NOT NULL DEFAULT '[]',
  status      VARCHAR(50)   NOT NULL DEFAULT 'available',
  notes       TEXT,
  image       TEXT,
  gallery     JSONB         NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- CUSTOMERS (Guests who book rooms)
CREATE TABLE IF NOT EXISTS customers (
  id             VARCHAR(100) PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) UNIQUE NOT NULL,
  phone          VARCHAR(50),
  address        TEXT,
  cnic_passport  VARCHAR(100),
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- RESERVATIONS (Bookings)
CREATE TABLE IF NOT EXISTS reservations (
  id              VARCHAR(100) PRIMARY KEY,
  booking_code    VARCHAR(50)   UNIQUE NOT NULL,
  customer_id     VARCHAR(100)  REFERENCES customers(id) ON DELETE SET NULL,
  room_id         VARCHAR(100)  REFERENCES rooms(id)     ON DELETE SET NULL,
  room_type       VARCHAR(100),
  check_in_date   DATE          NOT NULL,
  check_out_date  DATE          NOT NULL,
  nights          INTEGER       NOT NULL DEFAULT 1,
  guests          INTEGER       NOT NULL DEFAULT 1,
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  booking_status  VARCHAR(50)   NOT NULL DEFAULT 'confirmed',
  special_requests TEXT,
  booking_source  VARCHAR(100)  DEFAULT 'Website',
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- PAYMENTS (Financial transactions)
CREATE TABLE IF NOT EXISTS payments (
  id                   VARCHAR(100) PRIMARY KEY,
  reservation_id       VARCHAR(100) REFERENCES reservations(id) ON DELETE SET NULL,
  booking_code         VARCHAR(50),
  amount               NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method       VARCHAR(100)  DEFAULT 'Credit Card',
  payment_status       VARCHAR(50)   DEFAULT 'Paid',
  settled_at_checkout  BOOLEAN       DEFAULT FALSE,
  created_at           TIMESTAMPTZ   DEFAULT NOW()
);

-- ACTIVITY LOGS (Audit trail — append only)
CREATE TABLE IF NOT EXISTS activity_logs (
  id          VARCHAR(100) PRIMARY KEY,
  user_name   VARCHAR(255),
  user_role   VARCHAR(50),
  action      VARCHAR(255),
  module      VARCHAR(100),
  details     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- HOUSEKEEPING (Room cleaning tasks)
CREATE TABLE IF NOT EXISTS housekeeping (
  id           VARCHAR(100) PRIMARY KEY,
  room_id      VARCHAR(100) REFERENCES rooms(id) ON DELETE SET NULL,
  assigned_to  VARCHAR(255),
  task_type    VARCHAR(100),
  status       VARCHAR(50)  DEFAULT 'Pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

-- INVOICES (Custom invoices, not auto-generated ones)
CREATE TABLE IF NOT EXISTS invoices (
  id              VARCHAR(100) PRIMARY KEY,
  invoice_number  VARCHAR(100) UNIQUE NOT NULL,
  booking_id      VARCHAR(100),
  guest_name      VARCHAR(255),
  guest_email     VARCHAR(255),
  guest_phone     VARCHAR(50),
  room_number     VARCHAR(20),
  items           JSONB         NOT NULL DEFAULT '[]',
  subtotal_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount      NUMERIC(10,2) DEFAULT 0,
  total_amount    NUMERIC(10,2) DEFAULT 0,
  paid_amount     NUMERIC(10,2) DEFAULT 0,
  due_amount      NUMERIC(10,2) DEFAULT 0,
  status          VARCHAR(50)   DEFAULT 'Pending',
  payment_method  VARCHAR(100)  DEFAULT 'Credit Card',
  issue_date      DATE          DEFAULT CURRENT_DATE,
  due_date        DATE          DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_reservations_customer  ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room      ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status    ON reservations(booking_status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates     ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_payments_reservation   ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status           ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_logs_created           ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email        ON customers(email);
