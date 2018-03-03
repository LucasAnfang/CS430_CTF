
-- create the database for the ctf challenge
create database if not exists ctf_exercise_test;

-- switch db to the newly created one
use ctf_exercise_test;

create table ctf_users (
    _user_id bigint auto_increment primary key,
    username varchar(60) not null unique,
    pw varchar(255) not null,
    jwt_nonce int not null,
    balance int not null
);

-- create table balance_sheet (
--     user_id bigint auto_increment primary key,
--     username varchar(60) not null unique,
--     pw varchar(255) not null,
--     jwt_nonce int not null
-- );