-- MySQL dump 10.13  Distrib 8.0.32, for Linux (x86_64)
--
-- Host: localhost    Database: irc
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mint_properties_data`
--

DROP TABLE IF EXISTS `mint_properties_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mint_properties_data` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token_id` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `uri` varchar(255) NOT NULL,
  `contract` varchar(255) NOT NULL,
  `last_sync_block` varchar(45) NOT NULL,
  `property_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `current_owner` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=212 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mint_properties_data`
--

LOCK TABLES `mint_properties_data` WRITE;
/*!40000 ALTER TABLE `mint_properties_data` DISABLE KEYS */;
INSERT INTO `mint_properties_data` VALUES (191,'0','https://ipfs.io/ipfs/QmQvF4r1K4PTyx2MheNRAaE9bs8cW1i1PCs8F84vT9Cpq1','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:56','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(192,'1','https://ipfs.io/ipfs/QmVPQmrabTVhaQe46HukVc1LQXFVBbbZiQ7HhjouC9WiDZ','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:56','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(193,'2','https://ipfs.io/ipfs/QmfHUFWFTCaa65kkQk7RipPitTQAmsQ3tsCmEC2VqEcW9V','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:57','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(194,'3','https://ipfs.io/ipfs/QmeZRcU5rPnV5GvwViz9mq31tjgbEfooRvJhnDFPGRydsA','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:57','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(195,'4','https://ipfs.io/ipfs/QmZWGuGW54DEVxFQ93uPQuLLRvxNXYKLvbLvG6E6qsNHvS','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:58','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(196,'5','https://ipfs.io/ipfs/QmXxcsZ7vuDdBmQBZWAdhA6jDJiDNFs9iwM7dAXBQkH9aw','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:58','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(197,'6','https://ipfs.io/ipfs/QmUDzAvrW5cDhY2sFkabKnTNjhqyKfidUKU4jmSPDfnWUK','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:58','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(198,'7','https://ipfs.io/ipfs/QmSMbEKzZSXcNMRpXEoDqGsttacPwz2rSwKNWW3mQXrrbw','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493514',105,'2023-02-23 16:46:59','2023-02-23 16:46:59','0xf5781F4b93441172606db330A6B2d08aC7709496'),(199,'10','https://ipfs.io/ipfs/QmQvF4r1K4PTyx2MheNRAaE9bs8cW1i1PCs8F84vT9Cpq1','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:00','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(200,'11','https://ipfs.io/ipfs/QmVPQmrabTVhaQe46HukVc1LQXFVBbbZiQ7HhjouC9WiDZ','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:00','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(201,'12','https://ipfs.io/ipfs/QmfHUFWFTCaa65kkQk7RipPitTQAmsQ3tsCmEC2VqEcW9V','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:00','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(202,'13','https://ipfs.io/ipfs/QmeZRcU5rPnV5GvwViz9mq31tjgbEfooRvJhnDFPGRydsA','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:01','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(203,'14','https://ipfs.io/ipfs/QmZWGuGW54DEVxFQ93uPQuLLRvxNXYKLvbLvG6E6qsNHvS','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:01','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(204,'15','https://ipfs.io/ipfs/QmXxcsZ7vuDdBmQBZWAdhA6jDJiDNFs9iwM7dAXBQkH9aw','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:02','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(205,'16','https://ipfs.io/ipfs/QmUDzAvrW5cDhY2sFkabKnTNjhqyKfidUKU4jmSPDfnWUK','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:02','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(206,'17','https://ipfs.io/ipfs/QmSMbEKzZSXcNMRpXEoDqGsttacPwz2rSwKNWW3mQXrrbw','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27493579',105,'2023-02-23 16:47:03','2023-02-23 16:47:03','0xf5781F4b93441172606db330A6B2d08aC7709496'),(207,'20','https://ipfs.io/ipfs/QmNQPkb1w69zrCSaZMkNX4K424Xbza5AGc9GRv45SLpGCB','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27495183',106,'2023-02-23 16:47:04','2023-02-23 16:59:28','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),(208,'21','https://ipfs.io/ipfs/QmaQPjeQVN3hRVKnoMu5ctCMUnu3Hr4vnKEiHPRESqJt7t','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27495183',106,'2023-02-23 16:47:04','2023-02-23 17:15:47','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),(209,'22','https://ipfs.io/ipfs/QmT85VDgf5FdBGYdiPs9s8UbxNc3UExRsJvLfYLW4vC5Su','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27495183',106,'2023-02-23 16:47:05','2023-02-23 17:15:47','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),(210,'23','https://ipfs.io/ipfs/QmfEcYjM7s4KUx6dwPKVzapUFUP9HsiMSSFwaQbzSNrras','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27495183',106,'2023-02-23 16:47:05','2023-02-23 17:17:02','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'),(211,'24','https://ipfs.io/ipfs/Qmdqmeg7LcG5SD6JUApWDJ5e6v56aAikovTXcbDWDur5Ez','0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','27495183',106,'2023-02-23 16:47:06','2023-02-23 17:17:09','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
/*!40000 ALTER TABLE `mint_properties_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `property_description` text NOT NULL,
  `valuation` int NOT NULL,
  `property_category` varchar(45) DEFAULT NULL,
  `rental_returns` int NOT NULL,
  `estimated_appreciation` int NOT NULL,
  `property_images` varchar(1000) NOT NULL,
  `featured_image` varchar(100) NOT NULL,
  `total_number_of_fraction` int NOT NULL,
  `property_status` tinyint NOT NULL DEFAULT '1',
  `property_location` varchar(255) DEFAULT NULL,
  `fraction_price` float DEFAULT NULL,
  `min_fraction_buy` int DEFAULT NULL,
  `max_fraction_buy` int DEFAULT NULL,
  `is_minted` tinyint NOT NULL DEFAULT '0',
  `total_minted` int NOT NULL DEFAULT '0',
  `admin_id` int NOT NULL,
  `contract` varchar(255) DEFAULT NULL,
  `token_id` varchar(45) DEFAULT NULL,
  `last_sync_block` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`property_id`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (105,NULL,'Commercial Apartment','<p><em><strong>The Commercial Apartment</strong></em> consists of a large bright bedroom with a comfy king-sized bed, a modern fully-equipped kitchen and a sunlit living room with Apple TV and free Netflix account.</p>\n<p>It is the perfect place to stay for couples looking for a romantic location in the historic centre, within walking distance of some of the most beautiful sceneries you can find in the city and all famous landmarks. The sofa in the living room can also serve as an additional bed for a 3rd guest.</p>',50000,'VIP',500,1000,'d3890e8f3df973485ad4f2a44b72be50.jpg,73db234db9b72ce153cc0049046e1346.jpg,f18fef5cd92a797aca7f91273fac809a.jpg','37c1a1f1ae41d98b3ff6d241ac828c65.jpg',10,1,'Indore',2,1,3,1,10,1,NULL,NULL,NULL,'2023-02-23 15:15:01',NULL),(106,NULL,'Commercial Apartment 2','<p>Commercial Apartment 2</p>',500,'VIP',50,10,'f5e165618d6843bf66860c2a876440c6.jpg,f08fb60fb07459957f4e8d9686a0de74.jpg','6693370b96e71e73e21f4dc53117b239.jpg',5,1,'Indore',2,1,2,1,5,1,NULL,NULL,NULL,'2023-02-23 16:38:41',NULL);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_orders`
--

DROP TABLE IF EXISTS `property_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_orders` (
  `property_order_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  `currency` varchar(45) DEFAULT NULL,
  `note` varchar(45) DEFAULT NULL,
  `order_status` varchar(50) DEFAULT NULL,
  `payment_status` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `gas_transfer` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `nft_transfer` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `fractions` int DEFAULT NULL,
  `current_platform_fee` float DEFAULT NULL,
  `current_ira_value` float DEFAULT NULL,
  `calculated_gas_fee` float DEFAULT NULL,
  PRIMARY KEY (`property_order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_orders`
--

LOCK TABLES `property_orders` WRITE;
/*!40000 ALTER TABLE `property_orders` DISABLE KEYS */;
INSERT INTO `property_orders` VALUES (94,'order_LJxXnKpoaJkgOR',106,41,'2.00','INR','{\"user_id\":41,\"property_id\":\"106\"}','created','SUCCESS','SUCCESS','SUCCESS','2023-02-23 16:56:14','2023-02-23 16:57:11',1,2.5,0.32,0.016),(95,'order_LJxpawj1aewiN0',106,41,'4.00','INR','{\"user_id\":41,\"property_id\":\"106\"}','created','SUCCESS','SUCCESS','SUCCESS','2023-02-23 17:13:05','2023-02-23 17:14:08',2,2.5,0.32,0.032),(96,'order_LJxt9rvO1mtpit',106,41,'4.00','INR','{\"user_id\":41,\"property_id\":\"106\"}','created','SUCCESS','SUCCESS','SUCCESS','2023-02-23 17:16:28','2023-02-23 17:17:09',2,2.5,0.32,0.032);
/*!40000 ALTER TABLE `property_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_payments`
--

DROP TABLE IF EXISTS `property_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_payments` (
  `property_payments_id` int NOT NULL AUTO_INCREMENT,
  `property_order_id` int DEFAULT NULL,
  `propert_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` text,
  `razorpay_signature` text,
  `payment_status` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `gas_transfer` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `nft_transfer` enum('SUCCESS','FAILED','PENDING') DEFAULT NULL,
  `amount` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`property_payments_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_payments`
--

LOCK TABLES `property_payments` WRITE;
/*!40000 ALTER TABLE `property_payments` DISABLE KEYS */;
INSERT INTO `property_payments` VALUES (44,94,106,41,'order_LJxXnKpoaJkgOR','pay_LJxYKAzmRi6YsM','399407d3ac837bbbc85d596c7e2c0c5fd320c395e90157f661b92c1c8bfeb0c2','SUCCESS','SUCCESS','SUCCESS','2.00','2023-02-23 16:56:56','2023-02-23 16:57:11'),(45,95,106,41,'order_LJxpawj1aewiN0','pay_LJxq4bw2lctk6M','067ec26ccb00b5264d6f0b864e73b23cb26e2a011061cfd94465756de30a08a2','SUCCESS','SUCCESS','SUCCESS','4.00','2023-02-23 17:13:43','2023-02-23 17:14:08'),(46,96,106,41,'order_LJxt9rvO1mtpit','pay_LJxtK6dgHI53hm','6faa49e45b690e3b78aa0eb91261335af54a0434e04e2b704cf9330c0bd427b3','SUCCESS','SUCCESS','SUCCESS','4.00','2023-02-23 17:16:47','2023-02-23 17:17:09');
/*!40000 ALTER TABLE `property_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_settings`
--

DROP TABLE IF EXISTS `property_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `ira_token_value` float NOT NULL,
  `platform_fee` float DEFAULT NULL,
  `email_notification` tinyint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_settings`
--

LOCK TABLES `property_settings` WRITE;
/*!40000 ALTER TABLE `property_settings` DISABLE KEYS */;
INSERT INTO `property_settings` VALUES (27,1,0.32,2.5,0,'2023-02-22 10:45:14',NULL);
/*!40000 ALTER TABLE `property_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_contract`
--

DROP TABLE IF EXISTS `sync_contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_contract` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contract` varchar(100) NOT NULL,
  `birth_transaction_hash` varchar(200) NOT NULL,
  `creation_block` int NOT NULL,
  `last_sync_block` int NOT NULL,
  `last_sync_block_batch` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_contract`
--

LOCK TABLES `sync_contract` WRITE;
/*!40000 ALTER TABLE `sync_contract` DISABLE KEYS */;
INSERT INTO `sync_contract` VALUES (1,'0x80C9B65D7B6E78170E85e629d778b0CF1E3d7EB7','0x6184c2ca34422c1bf1db3e56cde9526316850cbbaecfadc3ea77e434a0ad998b',27493390,27495880,0,'2023-02-07 10:44:31',NULL);
/*!40000 ALTER TABLE `sync_contract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token_activity`
--

DROP TABLE IF EXISTS `token_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_activity` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token_id` text NOT NULL,
  `property_id` int DEFAULT NULL,
  `transfer_event` enum('TRANSFER','MINT','BURN') NOT NULL,
  `price` float DEFAULT NULL,
  `transfer_from` text NOT NULL,
  `transfer_to` text NOT NULL,
  `quantity` int DEFAULT NULL,
  `gas` int DEFAULT NULL,
  `transaction_hash` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token_activity`
--

LOCK TABLES `token_activity` WRITE;
/*!40000 ALTER TABLE `token_activity` DISABLE KEYS */;
INSERT INTO `token_activity` VALUES (318,'0',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:56',NULL),(319,'1',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:56',NULL),(320,'2',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:57',NULL),(321,'3',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:57',NULL),(322,'4',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:58',NULL),(323,'5',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:58',NULL),(324,'6',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:58',NULL),(325,'7',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(326,'0',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(327,'1',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(328,'2',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(329,'3',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(330,'4',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(331,'5',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(332,'6',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(333,'7',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x070bcc716b91f59fc5a0975d161d1c793a359c88382738e0aa81040747abb3cd','2023-02-23 16:46:59',NULL),(334,'10',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:00',NULL),(335,'11',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:00',NULL),(336,'12',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:00',NULL),(337,'13',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:01',NULL),(338,'14',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:01',NULL),(339,'15',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:02',NULL),(340,'16',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:02',NULL),(341,'17',105,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(342,'10',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(343,'11',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(344,'12',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(345,'13',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(346,'14',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(347,'15',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(348,'16',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(349,'17',105,'TRANSFER',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x4dc5a3cb25a43bbff8a71770372aa330bd85feb65706dbba589ce1ad8957a134','2023-02-23 16:47:03',NULL),(350,'20',106,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x252f2754fc5413579d8e9403b1e80ae56bb2dcb231337d3853a97d4fdb893551','2023-02-23 16:47:04',NULL),(351,'21',106,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x252f2754fc5413579d8e9403b1e80ae56bb2dcb231337d3853a97d4fdb893551','2023-02-23 16:47:04',NULL),(352,'22',106,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x252f2754fc5413579d8e9403b1e80ae56bb2dcb231337d3853a97d4fdb893551','2023-02-23 16:47:05',NULL),(353,'23',106,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x252f2754fc5413579d8e9403b1e80ae56bb2dcb231337d3853a97d4fdb893551','2023-02-23 16:47:05',NULL),(354,'24',106,'MINT',NULL,'0x0000000000000000000000000000000000000000','0xf5781F4b93441172606db330A6B2d08aC7709496',1,0,'0x252f2754fc5413579d8e9403b1e80ae56bb2dcb231337d3853a97d4fdb893551','2023-02-23 16:47:06',NULL),(355,'20',106,'TRANSFER',NULL,'0xf5781F4b93441172606db330A6B2d08aC7709496','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',1,0,'0x121ab2ec7ff1d323a6ac2e89d88a56202eff976a094fbfbcb17e370b693c7fb3','2023-02-23 16:59:28',NULL),(356,'21',106,'TRANSFER',NULL,'0xf5781F4b93441172606db330A6B2d08aC7709496','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',1,0,'0x5c54771d82abefbb92793fc6ee8cc29b979c6c366c47804378602377cfa14a46','2023-02-23 17:15:47',NULL),(357,'22',106,'TRANSFER',NULL,'0xf5781F4b93441172606db330A6B2d08aC7709496','0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',1,0,'0x7f7f253b5e9e97efb2bdfd84e042192d87988a32124b68b3c387ba9571515306','2023-02-23 17:15:47',NULL);
/*!40000 ALTER TABLE `token_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_bank_details`
--

DROP TABLE IF EXISTS `user_bank_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_bank_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_holder_name` varchar(45) NOT NULL,
  `account_no` varchar(45) NOT NULL,
  `bank_ifsc_code` varchar(45) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `cheque_image` varchar(100) NOT NULL,
  `bank_verification_status` enum('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_bank_details`
--

LOCK TABLES `user_bank_details` WRITE;
/*!40000 ALTER TABLE `user_bank_details` DISABLE KEYS */;
INSERT INTO `user_bank_details` VALUES (8,41,'sbi','Kalika','78523698547','741lsdfkjs12','indore','2beee4e9a2019b7d7d11c1ca563ac2eb.jpg','ACCEPTED','2023-02-14 14:36:39','2023-02-22 06:25:16');
/*!40000 ALTER TABLE `user_bank_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_kyc`
--

DROP TABLE IF EXISTS `user_kyc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_kyc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_aadhar_no` text,
  `user_pancard` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_kyc`
--

LOCK TABLES `user_kyc` WRITE;
/*!40000 ALTER TABLE `user_kyc` DISABLE KEYS */;
INSERT INTO `user_kyc` VALUES (5,41,'{\"fullName\":\"Shivam Chourasiya\",\"DOB\":\"1996-07-03\",\"gender\":\"M\",\"address\":{\"country\":\"India\",\"dist\":\"Raisen\",\"state\":\"Madhya Pradesh\",\"po\":\"Goharganj\",\"loc\":\"\",\"vtc\":\"Goharganj\",\"subdist\":\"Goharganj\",\"street\":\"Gram - amoda\",\"house\":\"House Num - 4/1\",\"landmark\":\"Tehsil - Goharganj\"},\"fatherName\":\"S/O: Narayan Prasad Chourasiya\"}','EPJPP9051N','2023-02-13 14:40:21',NULL);
/*!40000 ALTER TABLE `user_kyc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_masters`
--

DROP TABLE IF EXISTS `user_masters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_masters` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_full_name` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_password` varchar(255) DEFAULT NULL,
  `user_phone` varchar(50) DEFAULT NULL,
  `user_status` tinyint NOT NULL DEFAULT '0',
  `wallet_address` varchar(100) DEFAULT NULL,
  `nonce` int DEFAULT NULL,
  `is_phone_verified` tinyint DEFAULT '0',
  `user_type` enum('ADMIN','USER','AGENT') DEFAULT NULL,
  `is_email_verified` tinyint DEFAULT '0',
  `is_kyc_completed` tinyint DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_masters`
--

LOCK TABLES `user_masters` WRITE;
/*!40000 ALTER TABLE `user_masters` DISABLE KEYS */;
INSERT INTO `user_masters` VALUES (1,'admin','admin.property@gmail.com','f9277477fc6238b01456aa4084edb202','2345678554',1,'0xf5781F4b93441172606db330A6B2d08aC7709496',162719,0,'ADMIN',0,NULL,'2023-01-24 13:56:51',NULL),(41,'Kalika Prasad Mishra','kalikawebbuddy@gmail.com','1de52961c3a824453fd18895eba7a9b0','9827041963',1,'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',118259,1,'USER',1,1,'2023-02-06 12:23:35',NULL);
/*!40000 ALTER TABLE `user_masters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `whitelist_address`
--

DROP TABLE IF EXISTS `whitelist_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `whitelist_address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `whitelist_address`
--

LOCK TABLES `whitelist_address` WRITE;
/*!40000 ALTER TABLE `whitelist_address` DISABLE KEYS */;
INSERT INTO `whitelist_address` VALUES (7,41,'APPROVED','2023-02-23 16:49:46',NULL);
/*!40000 ALTER TABLE `whitelist_address` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-27 12:51:39
