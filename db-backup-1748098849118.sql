-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: barangay-db.c1ga824sw14r.ap-southeast-1.rds.amazonaws.com    Database: barangayDB
-- ------------------------------------------------------
-- Server version	8.4.4

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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `access_level` tinyint NOT NULL DEFAULT '1',
  `archive` enum('YES','NO') NOT NULL DEFAULT 'NO',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (2,'brgy58','yajucourtside@gmail.com','$2b$10$DoCPIMmdz8McQ5gyrAB3au7CGt24I2.ke/JGPOjHAAErIKhSLFV1O',2,'NO'),(3,'martin','martin@gmail.com','$2b$10$JSuq5OwArPJXt4GPviRXoOiN2IXWydBDTnYYAPxZ9wc/vy3B5Pr9.',1,'NO'),(4,'test','test@gmail.com','$2b$10$j8JIiftn.U1RktWcIqYpnOvsJF0uA.j4Khtm.EAYpDrf73j6Bkmbi',1,'NO'),(5,'ribiti','shibiti@gmail.com','$2b$10$IS7n3.HS7MbTi1ggRiQ2Xu86WKT.VtbM5OEUxQJJ3pSfHtvZy78ju',1,'NO');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archive_events`
--

DROP TABLE IF EXISTS `archive_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `event_name` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `venue` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archive_events`
--

LOCK TABLES `archive_events` WRITE;
/*!40000 ALTER TABLE `archive_events` DISABLE KEYS */;
INSERT INTO `archive_events` VALUES (82,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748017603974-495261763_122210161064089226_8663554242544816270_n (1).jpg','Happy Birthday Kap. AA!','2025-05-05','00:00:00','23:59:00','Brgy 58','Happiest Birthday to our hardworking Barangay Chairwoman\r\nHon. Andrea Amor D. Mercado\r\n\r\n#Barangay58Zone07\r\n#AAlabka','2025-05-23 16:19:57'),(83,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748017462174-bball.jpg','Basketball League 2025','2025-05-18','00:00:00','23:59:00','Brgy Court','Tune out for the Basketball League 2025! Hosted by SK Chairman: Hon. Ivan Villaluna and Kap AA!','2025-05-23 16:24:26'),(84,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748017928359-499420682_122207136428106251_7558044852156625142_n (1).jpg','Katipunan ng Kabataan Profiling','2025-05-24','00:00:00','23:59:00','Brgy Hall','Scan for more info ','2025-05-23 16:32:13'),(85,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748018163187-Childhood Dev (1).jpg','EARLY CHILDHOOD EDUCATION ENROLLMENT','2025-07-01','00:00:00','23:59:00','Pasay City','Ang Pasay Social Welfare Development Department ay nagaanyaya para sa mga magulang na nais ipasok ang kanilang mga anak sa Early Childhood Education (Pre-Kindergarten I: 3 taong gulang at Pre-Kindergarten II: 4 na taong gulang). Magsisimula ang enrollment ng Mayo 20, 2025 hanggang Hunyo 30, 2025.\r\n\r\nIhanda ang mga sumusunod:\r\n✔️Birth Certificate (photocopy)\r\n✔️ 1x1 picture (2 kopya)\r\n✔️ Certificate of Residency (original copy)\r\n✔️ Health Card/ Immunization\r\n\r\nMagsisimula ang pasok sa Hulyo 1, 2025. Para sa karagdagang katanungan at impormasyon, maaaring makipag-ugnayan sa Child Development Worker sa inyong barangay','2025-05-23 16:36:08'),(86,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748018380922-assembly (1).jpg','Barangay Assembly Day!','2025-05-24','09:00:00','12:00:00','Barangay 58 Hall','Magandang Buhay 58!\r\n\r\nInimbitahan ko po kayong lahat ngayong darating na Unang Barangay Assembly at KK Assembly para sa 2025, ika-24 ng Mayo, 2025 sa ganap na 9:00 ng umaga hanggang 12:00 ng tanghali sa event place, maki-alam, makilahok, makiisa!\r\n\r\nMamahagi narin po ng School Supplies para po sa mga Daycare, Kinder, Grade School, Highschool and College. Para lang po sa nailista ng mga kagawad at SK.\r\n\r\nKitakits!','2025-05-23 16:39:45');
/*!40000 ALTER TABLE `archive_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_events`
--

DROP TABLE IF EXISTS `backup_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `event_name` varchar(100) NOT NULL,
  `event_date` date NOT NULL,
  `time_start` time NOT NULL,
  `time_end` time NOT NULL,
  `venue` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `original_id` int NOT NULL,
  `backup_type` enum('create','update','delete') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_events`
--

LOCK TABLES `backup_events` WRITE;
/*!40000 ALTER TABLE `backup_events` DISABLE KEYS */;
INSERT INTO `backup_events` VALUES (3,NULL,'fortnire','2020-01-10','03:12:00','12:33:00','1103','31321c','2025-04-02 10:17:00',18,'create'),(7,NULL,'321d12','3222-03-20','03:13:00','15:13:00','312321','1213132','2025-04-02 10:57:39',16,'delete'),(8,NULL,'12331','3133-03-20','00:33:00','13:21:00','4141','3132','2025-04-02 10:57:49',14,'delete'),(9,NULL,'skibidi','2333-03-12','02:31:00','15:21:00','1103','Stoopid','2025-04-02 10:58:01',15,'delete'),(10,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743427488677-485477378_1181995630313338_4590484867513446422_n.png','ffdsfwef','2025-03-17','01:02:00','13:03:00','wrqrqw','qwrqr','2025-04-02 14:03:28',11,'delete'),(11,NULL,'Event','2025-11-07','19:10:00','10:11:00','Yest','TEST TEST TES','2025-04-02 23:56:03',19,'create'),(12,NULL,'Event','2025-11-06','19:10:00','10:11:00','Yest','TEST TEST TES','2025-04-02 23:56:22',19,'delete'),(14,NULL,'ADamsonda','4141-09-23','16:12:00','16:09:00','ADmdaow','TKADMWODM','2025-04-03 00:07:56',20,'create'),(16,NULL,'ASL Presentation','2025-04-03','10:30:00','12:06:00','Adamson University','Academic Service Learning Presentation of Group','2025-04-03 03:09:15',22,'create'),(17,NULL,'ASL Presentation Today','2025-04-04','10:30:00','12:06:00','Adamson University','Hello','2025-04-03 03:17:53',22,'update'),(18,NULL,'ASL Presentation Today','2025-04-03','10:30:00','12:06:00','Adamson University','Hello','2025-04-03 03:19:45',22,'delete'),(19,NULL,'Testing','2025-04-22','07:23:00','19:23:00','Here','sdfad','2025-04-27 06:20:40',23,'create'),(21,NULL,'Again','2025-04-22','00:32:00','12:31:00','123','123','2025-04-27 06:42:33',25,'create'),(22,NULL,'Again','2025-04-21','00:32:00','12:31:00','123','123','2025-04-27 08:13:44',25,'delete'),(24,NULL,'Sample','2025-06-13','14:30:00','16:30:00','SAMPLE','sample','2025-05-03 06:16:46',27,'create'),(26,NULL,'SAMPLE','2025-10-01','18:00:00','06:00:00','SAMPLE','SAMPLE','2025-05-03 06:22:26',29,'create'),(27,NULL,'g','2025-09-01','13:00:00','01:00:00','g','g','2025-05-03 06:23:33',30,'create'),(28,NULL,'g','2025-08-31','13:00:00','01:00:00','g','g','2025-05-05 02:22:03',30,'delete'),(29,NULL,'SAMPLE','2025-09-30','18:00:00','06:00:00','SAMPLE','SAMPLE','2025-05-05 02:22:06',29,'delete'),(31,NULL,'Sample','2025-06-12','14:30:00','16:30:00','SAMPLE','sample','2025-05-05 02:22:13',27,'delete'),(33,NULL,'Testing','2025-04-21','20:00:00','21:00:00','Osm','dfsd','2025-05-05 02:22:22',24,'delete'),(34,NULL,'Testing','2025-04-21','07:23:00','19:23:00','Here','sdfad','2025-05-05 02:22:25',23,'delete'),(36,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743427485701-485477378_1181995630313338_4590484867513446422_n.png','ffdsfwef','2025-03-17','01:02:00','13:03:00','wrqrqw','qwrqr','2025-05-06 14:45:33',10,'delete'),(40,NULL,'Skibidi thomas','2001-02-09','19:27:00','09:12:00','SV Mezzanine','SV MEZZANINE YESS','2025-04-03 01:51:45',34,'delete'),(42,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743494948426-d7826b4d-b5cd-48d9-949a-26ae44bca2ab.jpg','walang ibang choice hehe 123','2025-12-22','07:25:00','03:25:00','Cypher','Witness','2025-04-02 10:57:30',35,'delete'),(44,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743429198246-download (4).jpg','321321312','1998-04-21','00:33:00','02:31:00','13123313','2131231231231','2025-03-31 13:53:20',12,'delete'),(47,NULL,'tralalelo','2025-04-08','02:04:00','17:04:00','brgy','caption','2025-04-27 12:20:17',38,'delete'),(48,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1742902645155-download (3).jpg','awdwa','1414-04-14','03:12:00','15:12:00','21321','1f13','2025-03-25 11:37:29',2,'delete'),(54,NULL,'fortnire','2020-01-09','03:12:00','12:33:00','1103','31321c','2025-04-02 10:21:31',43,'delete'),(63,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743494948426-d7826b4d-b5cd-48d9-949a-26ae44bca2ab.jpg','walang ibang choice hehe 123','2025-12-23','07:25:00','03:25:00','Cypher','Witness','2025-04-02 10:16:15',54,'delete'),(68,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743494948426-d7826b4d-b5cd-48d9-949a-26ae44bca2ab.jpg','walang ibang choice','2025-12-23','07:25:00','03:25:00','Cypher','Witness','2025-05-18 15:15:45',67,'delete'),(69,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747739704920-profile.jpg','certiport','2025-05-15','08:00:00','10:00:00','cl3','certiporticert','2025-05-20 11:15:05',66,'delete'),(71,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1742996281655-9dc6fac2-f887-4f78-bc1a-baf4a71ed237.jpg','Dinner ng Gf ko kahapon','2025-03-25','16:00:00','17:00:00','Marugame Udon','Lagi niya daw inoorder yan hehe.','2025-03-26 13:38:05',46,'delete'),(72,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1742995808355-download (4).jpg','Adamson University Yakap Party','2026-07-25','19:25:00','04:09:00','Adamson University Sv Court','YESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS\r\n\r\nYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSYESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS','2025-03-26 13:30:12',68,'delete'),(73,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743337962373-BuildHers Event Announcement & Registration.jpg','BuildHers','2025-04-01','08:31:00','22:33:00','ORACLE ARENA','BuildHer\'s, BuildHers, BuildHer\'s, BuildHers, BuildHer\'s, BuildHers, ','2025-03-30 12:32:42',64,'delete'),(74,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743433939965-41cbc888-f1c1-4872-9449-0c3d6b90ed4d.png','heyheyheybawgdgbeeawdbu','2025-12-25','12:05:00','01:03:00','sort','sksrt','2025-03-31 15:12:20',52,'delete'),(75,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743433939965-41cbc888-f1c1-4872-9449-0c3d6b90ed4d.png','heyheyheybawgdgbeeawdbu','2025-12-25','12:05:00','01:03:00','sort','sksrt','2025-04-02 23:56:54',59,'delete'),(76,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1742902451184-download (3).jpg','Hev Abi Concert','2026-12-25','00:00:00','00:01:00','1103','Tomas Morato','2025-03-25 11:34:14',69,'delete'),(77,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743413797853-480816244_549367924140057_2497936293978747407_n.jpg','321312','0312-03-12','04:14:00','15:12:00','3131231','141f111331','2025-03-31 09:36:38',8,'delete'),(78,NULL,'skibidimismo','1133-06-04','04:13:00','09:03:00','Adamson','Skibidi','2025-05-15 14:50:55',45,'delete'),(79,NULL,'Skibidi thomas','2001-02-08','19:27:00','09:12:00','SV Mezzanine','SV MEZZANINE YESS','2025-05-05 02:22:27',53,'delete'),(80,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747897190370-aaron.png','tralalelo','2025-04-07','02:04:00','17:04:00','brgy','caption','2025-05-05 02:22:16',56,'delete'),(81,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747897190370-aaron.png','tralalelo','2025-04-07','02:04:00','17:04:00','brgy','caption','2025-05-05 02:22:16',56,'delete'),(83,NULL,'dsfsdf','2025-05-14','05:57:00','20:56:00','dfsd','dsfsd','2025-05-23 09:56:37',80,'delete'),(84,NULL,'BuildHers','2025-05-30','17:54:00','20:53:00','dfsdf','d','2025-05-23 09:53:40',79,'delete'),(85,NULL,'sdfsdf','2025-05-07','17:48:00','05:48:00','SV Mezzanine','4gvcgf5','2025-05-23 09:48:09',78,'delete'),(86,NULL,'sdfsdf','2025-05-07','17:41:00','17:42:00','SV Mezzanine','dss','2025-05-23 09:40:30',77,'delete'),(87,NULL,'try','2025-05-21','17:40:00','05:39:00','SV Mezzanine','ddsfsd','2025-05-23 09:40:03',76,'delete'),(88,NULL,'try','2025-05-21','17:34:00','18:33:00','SV Mezzanine','testing','2025-05-23 09:34:12',75,'delete'),(89,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747992671708-Screenshot 2023-12-04 210937.png','BuildHers','2025-05-21','17:31:00','17:34:00','SV Mezzanine','try','2025-05-23 09:31:11',81,'delete'),(91,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747981485751-Zinedine Zidane.jpg','walang ibang choice hehe','2025-05-24','08:00:00','09:00:00','Lobolbo','Every sight','2025-05-23 06:24:46',72,'delete'),(92,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747981438154-3a1674f2-b90c-4f6b-8908-99bf3999a709.jpg','Test','2026-09-21','14:26:00','15:29:00','1103','skibidi','2025-05-23 06:24:00',71,'delete'),(93,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747981398279-Brat Album cover generator.jpg','dabidd','2025-07-26','17:03:00','10:03:00','1103','Omaigad','2025-05-23 06:23:20',70,'delete'),(94,NULL,'Sample Ulit','2025-07-02','13:00:00','14:00:00','SampleUlit','SampleUlit','2025-05-05 02:22:08',58,'delete'),(95,NULL,'Sample Ulit','2025-07-03','13:00:00','14:00:00','SampleUlit','SampleUlit','2025-05-03 06:20:38',61,'delete'),(96,NULL,'Testing','2025-04-22','20:00:00','21:00:00','Osm','dfsd','2025-04-27 06:31:24',60,'delete'),(97,NULL,'ADamsonda','4141-09-23','16:12:00','16:09:00','ADmdaow','TKADMWODM','2025-04-03 00:07:55',62,'delete'),(98,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743413878393-482841855_579674641783382_7779251793460109055_n.jpg','32131311','3222-11-12','14:31:00','00:31:00','3213213','f113123','2025-03-31 09:37:58',9,'delete'),(99,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1743310223301-474452489_1655280115069350_8653539721267408376_n.jpg','dabidd','2005-07-26','19:00:00','09:09:00','Bahay Namin','Join us for the Adamson University Yakap Party, a heartwarming celebration of community, unity, and shared joy! Hosted at Adamson University, this special barangay event invites students, residents, and friends to come together for a night filled with music, fun activities, and the spirit of togetherness. \"Yakap\" means \"embrace,\" and this event is all about embracing connections—old and new—through games, performances, and meaningful interactions. Whether you\'re looking to make new friends, reconnect with neighbors, or simply enjoy a lively and welcoming atmosphere, the Yakap Party promises an unforgettable experience for all.\r\n\r\nDon\'t miss this chance to be part of a night filled with laughter, entertainment, and community bonding! Expect live performances, delicious food, and engaging activities designed to bring everyone closer. Let’s celebrate the warmth of friendship and the strength of our barangay as we come together under the vibrant lights of Adamson University. Bring your energy, your smiles, and your open hearts—because at the Yakap Party, everyone is family!','2025-03-30 04:50:24',48,'delete'),(100,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748067906950-assembly.jpg','Test','1111-11-11','11:11:00','11:11:00','aa','aa','2025-05-24 06:25:07',87,'delete'),(102,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1748084577739-1743494942054-d7826b4d-b5cd-48d9-949a-26ae44bca2ab.jpg','blue bills on me nakaktutok sas alamain','2001-09-03','04:09:00','16:01:00','Bahay Namin','yg ng langsangan dappat gawin','2025-05-24 11:02:59',90,'delete'),(103,'https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/events/1747981586008-37eaf68c-b8b6-4bbb-b678-39aa9346347b.jpg','no drugs in heaven','2025-05-10','01:10:00','15:10:00','1103','Understand','2025-05-23 06:26:27',88,'delete');
/*!40000 ALTER TABLE `backup_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_household_members`
--

DROP TABLE IF EXISTS `backup_household_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_household_members` (
  `id` int NOT NULL,
  `household_id` int NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `birth_place` varchar(255) NOT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') NOT NULL,
  `citizenship` varchar(100) NOT NULL,
  `occupation` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sex_other` varchar(50) DEFAULT NULL,
  `suffix_id` int DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `relationship_id` int DEFAULT NULL,
  `relationship_other` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `household_id` (`household_id`),
  KEY `fk_backup_household_members_suffix` (`suffix_id`),
  KEY `fk_backup_household_members_sex` (`sex`),
  KEY `fk_backup_household_relationship` (`relationship_id`),
  CONSTRAINT `backup_household_members_ibfk_1` FOREIGN KEY (`household_id`) REFERENCES `backup_households` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_backup_household_members_sex` FOREIGN KEY (`sex`) REFERENCES `sex_options` (`id`),
  CONSTRAINT `fk_backup_household_members_suffix` FOREIGN KEY (`suffix_id`) REFERENCES `suffixes` (`id`),
  CONSTRAINT `fk_backup_household_relationship` FOREIGN KEY (`relationship_id`) REFERENCES `relationships` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_household_members`
--

LOCK TABLES `backup_household_members` WRITE;
/*!40000 ALTER TABLE `backup_household_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_household_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_households`
--

DROP TABLE IF EXISTS `backup_households`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_households` (
  `id` int NOT NULL,
  `head_first_name` varchar(255) NOT NULL,
  `head_middle_name` varchar(255) DEFAULT NULL,
  `head_last_name` varchar(255) NOT NULL,
  `birth_date` date NOT NULL,
  `birth_place` varchar(255) NOT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') NOT NULL,
  `citizenship` varchar(100) NOT NULL,
  `occupation` varchar(255) NOT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `house_unit_no` varchar(50) NOT NULL,
  `street_name` varchar(255) NOT NULL,
  `subdivision` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `sex_other` varchar(50) DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `head_suffix_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_backup_households_sex` (`sex`),
  KEY `fk_backup_households_suffix` (`head_suffix_id`),
  CONSTRAINT `fk_backup_households_sex` FOREIGN KEY (`sex`) REFERENCES `sex_options` (`id`),
  CONSTRAINT `fk_backup_households_suffix` FOREIGN KEY (`head_suffix_id`) REFERENCES `suffixes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_households`
--

LOCK TABLES `backup_households` WRITE;
/*!40000 ALTER TABLE `backup_households` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_households` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_requests`
--

DROP TABLE IF EXISTS `backup_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `last_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `contact_no` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `purpose_of_request` text,
  `number_of_copies` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo_url` text,
  `s3_key` text,
  `original_id` int DEFAULT NULL,
  `sex_other` varchar(50) DEFAULT NULL,
  `suffix_id` int DEFAULT NULL,
  `certificate_id` int DEFAULT NULL,
  `status_id` int NOT NULL DEFAULT '1' COMMENT '1=pending (default)',
  `control_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_backup_requests_sex` (`sex`),
  KEY `fk_backup_suffix_id` (`suffix_id`),
  KEY `fk_backup_certificate_id` (`certificate_id`),
  KEY `fk_backup_requests_status` (`status_id`),
  CONSTRAINT `fk_backup_certificate_id` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_backup_requests_sex` FOREIGN KEY (`sex`) REFERENCES `sex_options` (`id`),
  CONSTRAINT `fk_backup_requests_status` FOREIGN KEY (`status_id`) REFERENCES `request_statuses` (`id`),
  CONSTRAINT `fk_backup_suffix_id` FOREIGN KEY (`suffix_id`) REFERENCES `suffixes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_requests`
--

LOCK TABLES `backup_requests` WRITE;
/*!40000 ALTER TABLE `backup_requests` DISABLE KEYS */;
INSERT INTO `backup_requests` VALUES (92,'Koncord','Reginald','Bustos',1,'1889-05-10','9123232402','jmgcacao@gmail.com','173, S.Santiago, Koalangpot','2025-04-12',213,'2025-05-22 06:48:52',NULL,NULL,144,NULL,2,2,1,NULL),(94,'Csas','Dsda','Jose',1,'2025-05-22','9123232402','jmgcacao@gmail.com','12, 12, Dsda','2025-04-12',213,'2025-05-22 03:11:19',NULL,NULL,136,NULL,2,3,2,NULL),(95,'Dsda','Dsda','Jose',1,'2025-05-15','9123232402','jmgcacao@gmail.com','12, Dsda, Dsda','2025-04-12',213,'2025-05-22 03:27:58',NULL,NULL,134,NULL,1,1,2,NULL),(96,'Csas','Dsda','Jose',1,'2025-04-30','9123232402','jmgcacao@gmail.com','12, 12, 21','2025-04-12',213,'2025-05-22 03:31:06',NULL,NULL,132,NULL,1,3,2,NULL),(97,'Test','Test','Test',1,'2025-05-08','9123232402','jmgcacao@gmail.com','12, 12, Dsda','2025-04-12',213,'2025-05-22 02:57:47',NULL,NULL,138,NULL,2,4,2,NULL),(98,'Csas','Dsda','Jose',1,'2025-04-30','9123232402','jmgcacao@gmail.com','12, 12, 21','2025-04-12',213,'2025-05-22 03:31:06',NULL,NULL,133,NULL,1,3,2,NULL),(100,'Cacao','Martin','Jose',1,'1889-05-15','9123232402','jmgcacao@gmail.com','12, Atoewr, Dsda','2025-04-12',213,'2025-05-22 07:07:15',NULL,NULL,147,NULL,2,4,2,NULL),(102,'Csas','Dsda','Jose',1,'2025-05-09','9123232402','jmgcacao@gmail.com','12, 21, Dsda','2025-04-12',213,'2025-05-22 04:13:13',NULL,NULL,130,NULL,2,3,2,NULL),(104,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',159,NULL,1,1,1,NULL),(105,'John','Hafenvela','Regala',1,'2011-05-06','9493396268','mulufulu00@gmail.com','11, 11, 11','Gnarly!~',1,'2025-05-23 05:51:34',NULL,NULL,160,NULL,1,5,1,NULL),(106,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',158,NULL,1,1,1,NULL),(107,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',157,NULL,1,1,1,NULL),(108,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',156,NULL,1,1,1,NULL),(109,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:30','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',155,NULL,1,1,1,NULL),(110,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:47:26','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',154,NULL,1,1,1,NULL),(111,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 05:45:47','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',153,NULL,1,1,1,NULL),(112,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:02',NULL,NULL,169,NULL,1,5,1,NULL),(113,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:02',NULL,NULL,168,NULL,1,5,1,NULL),(114,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:02',NULL,NULL,166,NULL,1,5,1,NULL),(115,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:02',NULL,NULL,167,NULL,1,5,1,NULL),(116,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:01',NULL,NULL,165,NULL,1,5,1,NULL),(117,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:55:00',NULL,NULL,164,NULL,1,5,1,NULL),(118,'Gaguis','Andrei','Jayq',1,'2009-05-20','9493396268','mulufulu00@gmail.com','11, 11, 1','Gnarly!~',1,'2025-05-23 06:09:10',NULL,NULL,177,NULL,1,5,1,NULL),(119,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:51',NULL,NULL,176,NULL,1,5,1,NULL),(120,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:51',NULL,NULL,175,NULL,1,5,1,NULL),(121,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:51',NULL,NULL,174,NULL,1,5,1,NULL),(122,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:51',NULL,NULL,173,NULL,1,5,1,NULL),(123,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:51',NULL,NULL,172,NULL,1,5,1,NULL),(124,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:27',NULL,NULL,186,NULL,1,5,1,NULL),(125,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:27',NULL,NULL,185,NULL,1,5,1,NULL),(126,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:27',NULL,NULL,184,NULL,1,5,1,NULL),(127,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:27',NULL,NULL,183,NULL,1,5,1,NULL),(128,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:27',NULL,NULL,182,NULL,1,5,1,NULL),(129,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:24:25',NULL,NULL,181,NULL,1,5,1,NULL),(135,'Gaguis','Andrei','Jayq',1,'2018-05-18','9493396268','mulufulu00@gmail.com','11, 357 S. Fernando, 11','certcertcert',1,'2025-05-23 06:23:47',NULL,NULL,180,NULL,1,5,2,NULL),(136,'1','1','1',1,'2017-05-18','9493396268','mulufulu00@gmail.com','123, 1, 1','certcertcert',1,'2025-05-23 06:16:39',NULL,NULL,179,NULL,2,5,2,NULL),(137,'Junnie','Van Damme','Claude',1,'2009-05-08','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-23 06:13:31',NULL,NULL,178,NULL,1,5,2,NULL),(139,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:59:48',NULL,NULL,171,NULL,1,5,2,NULL),(140,'Gaguis','Bendania','Jhian Scarlett',2,'2016-05-13','9493396268','mulufulu00@gmail.com','1, 11, 1','Testing',1,'2025-05-23 05:57:58',NULL,NULL,170,NULL,1,5,2,NULL),(142,'Gaguis','Bendania','Jayq Andrei',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 111','Gnarly!~',1,'2025-05-23 05:54:30',NULL,NULL,163,NULL,1,5,2,NULL),(145,'Singko','Chingko','Dingko',1,'1998-05-15','9669332659','davidpomasinsp@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-23 12:06:44',NULL,NULL,200,NULL,1,5,1,NULL),(148,'Jayver','Tena','Jay Jay',1,'2025-05-02','9669332659','yajucourtside@gmail.com','12, EScuella, Piccolo','1',1,'2025-05-23 13:06:08',NULL,NULL,206,NULL,1,5,2,'2025-0008'),(152,'Gaguis','Bendania','Jhian Scarlett',2,'2007-08-11','9765575793','scarlettgaguis@gmail.com','357,  S. Fernando, Pasay','School Purpose',1,'2025-05-23 16:43:09',NULL,NULL,220,NULL,1,4,1,NULL),(153,'Siri','BingBong','Boyd',1,'2025-05-07','9669332659','yajucourtside@gmail.com','12, Escuella, Piccolo','1',1,'2025-05-23 14:42:42','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748011361170.jpg','request_images/request_1748011361170.jpg',213,NULL,1,4,1,NULL);
/*!40000 ALTER TABLE `backup_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificate_sequences`
--

DROP TABLE IF EXISTS `certificate_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_sequences` (
  `certificate_type` varchar(50) NOT NULL,
  `last_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`certificate_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_sequences`
--

LOCK TABLES `certificate_sequences` WRITE;
/*!40000 ALTER TABLE `certificate_sequences` DISABLE KEYS */;
INSERT INTO `certificate_sequences` VALUES ('Barangay Certificate',6),('Barangay Clearance',2),('Barangay ID',0),('Certificate of Indigency',0);
/*!40000 ALTER TABLE `certificate_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (5,'Barangay Certificate'),(4,'Barangay Clearance'),(1,'Barangay ID Application'),(3,'Barangay Jobseeker'),(2,'Certificate of Indigency');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `household_members`
--

DROP TABLE IF EXISTS `household_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `household_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `household_id` int DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') NOT NULL,
  `citizenship` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `sex_other` varchar(50) DEFAULT NULL,
  `suffix_id` int DEFAULT NULL,
  `relationship_id` int DEFAULT NULL,
  `relationship_other` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_household` (`household_id`),
  KEY `fk_household_members_sex` (`sex`),
  KEY `fk_household_members_suffix` (`suffix_id`),
  KEY `fk_household_relationship` (`relationship_id`),
  CONSTRAINT `fk_household` FOREIGN KEY (`household_id`) REFERENCES `households` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_household_members_sex` FOREIGN KEY (`sex`) REFERENCES `sex_options` (`id`),
  CONSTRAINT `fk_household_members_suffix` FOREIGN KEY (`suffix_id`) REFERENCES `suffixes` (`id`),
  CONSTRAINT `fk_household_relationship` FOREIGN KEY (`relationship_id`) REFERENCES `relationships` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `household_members`
--

LOCK TABLES `household_members` WRITE;
/*!40000 ALTER TABLE `household_members` DISABLE KEYS */;
INSERT INTO `household_members` VALUES (27,28,'Limmy','John Sivers','Rettinate','Muntinlupa','2025-04-06','Single','Filipino','Single',1,NULL,2,NULL,NULL),(28,29,'Limmy','John Sivers','Rettinate','Muntinlupa','2025-04-06','Single','Filipino','Single',1,NULL,2,NULL,NULL),(29,31,'John','Jay Jay','Andrei','Palasio','1778-05-08','Single','Filipino','Unemployed',4,'Trans',3,NULL,NULL),(30,32,'Skibiri','Umaga','Torres','Palasio','2009-06-11','Single','Boys','Unemployed',1,NULL,6,NULL,NULL),(31,33,'John','Claude','Van Damme','Palasio','2025-05-07','Single','Filipino','Unemployed',2,NULL,1,NULL,NULL),(32,34,'Jayver','Claude','Andrei','Palasio','2025-05-12','Married','American','Employed',4,'gay',2,9,'creatue'),(33,35,'Riddler','Moneymaker','Magicman','Palasio','1964-05-01','Single','Filipino','Unemployed',1,NULL,3,NULL,NULL),(34,36,'Quitlong','Charlize','Tena','Palasio','1996-05-10','Single','Filipino','Student',1,NULL,1,4,NULL),(35,37,'Sendai','Poole','Viner','Palasio','1776-05-10','Single','Filipino','Employed',2,NULL,1,6,NULL),(36,39,'Cacao','Jose','Martin','Muntinlupa','2025-04-11','Single','Filipino','Self-employed',2,NULL,2,NULL,NULL),(37,40,'Cacao','Jose','Martin','Muntinlupa','2025-04-11','Married','Filipino','Self-employed',1,NULL,3,NULL,NULL),(38,41,'Income','But','My','income','1969-06-09','Widowed','Filipino','Self-employed',3,NULL,2,NULL,NULL),(39,42,'Cacao','Jose','Martin','Muntinlupa','2025-04-11','Single','Filipino','Employed',1,NULL,6,NULL,NULL),(40,42,'Test','Test','Test','Muntinlupa','2025-04-11','Single','Filipino','Homemaker',2,NULL,2,NULL,NULL),(41,42,'Qwesaaasad','Asdsadsdsas','Asd','Muntinlupa','2025-04-30','Married','Filipino','Unable to Work',1,NULL,3,NULL,NULL),(42,41,'Jeane','Jeane','Jeane','jeane','2003-06-09','Widowed','Filipino','Homemaker',3,NULL,1,NULL,NULL),(43,43,'Ignacio','Rashid','Posadas','Pasay City','2025-05-01','Married','Filipino','Employed',1,NULL,2,2,NULL),(44,44,'Ignacio','Rashid','Posadas','Pasay City','2025-05-01','Married','Filipino','Employed',1,NULL,2,2,NULL),(45,45,'Ignacio','Rashid','Posadas','Pasay City','2025-05-01','Single','Filipino','Student',1,NULL,1,1,NULL),(46,46,'Ignacio','Rashid','Posadas','Pasay City','2025-05-01','Single','Filipino','Student',1,NULL,1,1,NULL),(47,48,'Jayver','Jay Jay','Van Damme','Palasio','2025-05-06','Single','Filipino','Employed',1,NULL,2,9,'Wife');
/*!40000 ALTER TABLE `household_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `households`
--

DROP TABLE IF EXISTS `households`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `households` (
  `id` int NOT NULL AUTO_INCREMENT,
  `head_last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `head_first_name` varchar(100) DEFAULT NULL,
  `head_middle_name` varchar(100) DEFAULT NULL,
  `house_unit_no` varchar(100) DEFAULT NULL,
  `street_name` varchar(100) DEFAULT NULL,
  `subdivision` varchar(100) DEFAULT NULL,
  `birth_place` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated','Divorced') NOT NULL,
  `citizenship` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `email_address` varchar(150) DEFAULT NULL,
  `status` enum('pending','approved','rejected','for interview') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT (now()),
  `head_suffix_id` int DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `sex_other` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_households_suffix` (`head_suffix_id`),
  CONSTRAINT `fk_households_suffix` FOREIGN KEY (`head_suffix_id`) REFERENCES `suffixes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `households`
--

LOCK TABLES `households` WRITE;
/*!40000 ALTER TABLE `households` DISABLE KEYS */;
INSERT INTO `households` VALUES (28,'Limmy','John Sivers','Rettinate','12','Atoewr','Rettinate','Muntinlupa','2025-04-12','Widowed','Filipino','Single','jmgcacao@gmail.com','rejected','2025-05-22 13:25:18',2,1,NULL),(29,'Limmy','John Sivers','Rettinate','12','Atoewr','Rettinate','Muntinlupa','2025-04-12','Widowed','Filipino','Single','jmgcacao@gmail.com','approved','2025-05-22 13:25:19',2,1,NULL),(30,'Limmy','John Sivers','Rettinate','12','Atoewr','Rettinate','Muntinlupa','2025-04-09','Separated','Filipino','Single','jmgcacao@gmail.com','approved','2025-05-22 13:27:59',1,1,NULL),(31,'Tulfo','Sigma','Reggies','1345','Escuela','Piccolo','Palasio','1889-05-09','Single','Fried','Employed','yajucourtside@gmail.com','approved','2025-05-22 13:46:48',2,1,NULL),(32,'Pomasin','David Jonathan','Tena','1345','Escuela','Piccolo','Palasio','2005-07-26','Single','Filipino','Unemployed','yajucourtside@gmail.com','approved','2025-05-22 13:55:05',1,1,NULL),(33,'Tenki','Sogie','Fellows','1345','Escuela','Taguig','Palasio','2025-07-17','Married','Filipino','Unemployed','yajucourtside@gmail.com','approved','2025-05-22 14:10:58',1,1,NULL),(34,'Koke','Miko','Fineshyt','1345','Escuela','Sitio','Palasio','2025-05-20','Single','Filipino','Unemployed','yajucourtside@gmail.com','approved','2025-05-22 14:20:08',2,1,NULL),(35,'Bogart','Bonbon','Bluey','1345','1214','Purok','Palasio','1997-09-12','Single','Filipino','Unemployed','yajucourtside@gmail.com','approved','2025-05-22 14:32:37',1,2,NULL),(36,'Courtier','Lebron','Skimmer','1445','Escuela','41','Palasio','2025-05-21','Single','Filipino','Employed','yajucourtside@gmail.com','approved','2025-05-22 14:48:23',3,1,NULL),(37,'Jimmy','Freddette','Lopsided','1345','1214','Taguig','Palasio','2025-05-15','Single','Filipino','Employed','yajucourtside@gmail.com','approved','2025-05-22 15:33:35',1,4,'Gay'),(38,'Garcia','Freddette','mannik','1345','Escuela','Purok','Palasio','1998-09-22','Single','Filipino','Employed','yajucourtside@gmail.com','approved','2025-05-22 16:11:30',NULL,1,NULL),(39,'Cacao','Jose','Martin','173','Atoewr','Rettinate','Muntinlupa','2025-04-11','Single','Filipino','Unemployed','jmgcacao@gmail.com','approved','2025-05-22 16:30:25',2,2,NULL),(40,'Cacao','Jose','Martin','173','Atoewr','Rettinate','Muntinlupa','2025-04-11','Single','Filipino','Student','jmgcacao@gmail.com','approved','2025-05-22 16:31:31',2,3,NULL),(41,'Typhlosion','Typhlosion','Typhlosion','1','hisui','hisui','Hisui','1999-03-03','Single','Pokemon','Homemaker','typhlosion@gmail.com','approved','2025-05-23 06:33:17',NULL,3,NULL),(42,'Cacao','Jose','Martin','173','Atoewr','Rettinate','Muntinlupa','2025-04-11','Single','Filipino','Homemaker','jmgcacao@gmail.com','approved','2025-05-23 09:19:24',6,4,'dasd'),(43,'Ignacio','Rashid','Posadas','511','Taylo St.','Barangay 58','Rodriguez, Rizal','2025-05-04','Single','Filipino','Employed','ignaciorashid04@gmail.com','rejected','2025-05-24 01:25:28',2,1,NULL),(44,'Ignacio','Rashid','Posadas','511','Taylo St.','Barangay 58','Rodriguez, Rizal','2025-05-04','Single','Filipino','Employed','ignaciorashid04@gmail.com','approved','2025-05-24 01:25:28',2,1,NULL),(45,'Ignacio','Rashid','Posadas','511','Taylo St.','Barangay 58','Rodriguez, Rizal','2025-05-04','Single','Filipino','Employed','ignaciorashid04@gmail.com','approved','2025-05-24 02:32:05',1,1,NULL),(46,'Ignacio','Rashid','Posadas','511','Taylo St.','Barangay 58','Rodriguez, Rizal','2025-05-04','Single','Filipino','Employed','ignaciorashid04@gmail.com','approved','2025-05-24 02:32:06',1,1,NULL),(47,'Ribidi','David Jonathan','Jen','1345','Escuela','41','Palasio','2025-05-13','Single','Filipino','Employed','yajucourtside@gmail.com','approved','2025-05-24 09:21:17',NULL,3,NULL),(48,'Crazy','Bunto','Kenny','1345','Escuela','Piccolo','Palasio','2009-05-08','Married','Filipino','Unemployed','yajucourtside@gmail.com','approved','2025-05-24 11:18:18',1,1,NULL);
/*!40000 ALTER TABLE `households` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationships`
--

DROP TABLE IF EXISTS `relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationships`
--

LOCK TABLES `relationships` WRITE;
/*!40000 ALTER TABLE `relationships` DISABLE KEYS */;
INSERT INTO `relationships` VALUES (1,'Mother'),(2,'Father'),(3,'Son'),(4,'Daughter'),(5,'Brother'),(6,'Sister'),(7,'Grandmother'),(8,'Grandfather'),(9,'Others');
/*!40000 ALTER TABLE `relationships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `request_statuses`
--

DROP TABLE IF EXISTS `request_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `request_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_status_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `request_statuses`
--

LOCK TABLES `request_statuses` WRITE;
/*!40000 ALTER TABLE `request_statuses` DISABLE KEYS */;
INSERT INTO `request_statuses` VALUES (2,'approved'),(4,'for pickup'),(1,'pending'),(3,'rejected');
/*!40000 ALTER TABLE `request_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `last_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `sex` int DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `contact_no` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `purpose_of_request` text,
  `number_of_copies` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo_url` varchar(255) DEFAULT NULL,
  `s3_key` varchar(255) DEFAULT NULL,
  `sex_other` varchar(50) DEFAULT NULL,
  `suffix_id` int DEFAULT NULL,
  `certificate_id` int DEFAULT NULL,
  `status_id` int NOT NULL DEFAULT '1' COMMENT '1=pending (default)',
  `control_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_requests_sex` (`sex`),
  KEY `fk_suffix_id` (`suffix_id`),
  KEY `fk_certificate_id` (`certificate_id`),
  KEY `fk_requests_status` (`status_id`),
  CONSTRAINT `fk_certificate_id` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_requests_sex` FOREIGN KEY (`sex`) REFERENCES `sex_options` (`id`),
  CONSTRAINT `fk_requests_status` FOREIGN KEY (`status_id`) REFERENCES `request_statuses` (`id`),
  CONSTRAINT `fk_suffix_id` FOREIGN KEY (`suffix_id`) REFERENCES `suffixes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES (135,'Dsda','Dsda','Jose',1,'2025-05-15','9123232402','jmgcacao@gmail.com','12, Dsda, Dsda','2025-04-12',213,'2025-05-22 03:27:58',NULL,NULL,NULL,1,1,2,NULL),(137,'Csas','Dsda','Jose',1,'2025-05-22','9123232402','jmgcacao@gmail.com','12, 12, Dsda','2025-04-12',213,'2025-05-22 03:11:19',NULL,NULL,NULL,2,3,2,NULL),(139,'Test','Test','Test',1,'2025-05-08','9123232402','jmgcacao@gmail.com','12, 12, Dsda','2025-04-12',213,'2025-05-22 02:57:47',NULL,NULL,NULL,2,4,2,NULL),(140,'Junnie','Skimber','Claude',1,'1889-05-03','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-21 15:58:51',NULL,NULL,NULL,2,2,2,NULL),(141,'Junnie','Skimber','Claude',1,'1889-05-03','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-21 15:58:51',NULL,NULL,NULL,2,2,2,NULL),(142,'John','Tena','Jay Jay',1,'1998-07-08','9669332659','yajucourtside@gmail.com','1734, Escuella, Purok','1',1,'2025-05-21 15:53:50',NULL,NULL,NULL,2,3,2,NULL),(143,'John','Tena','Jay Jay',1,'1998-07-08','9669332659','yajucourtside@gmail.com','1734, Escuella, Purok','1',1,'2025-05-21 15:53:50',NULL,NULL,NULL,2,3,2,NULL),(144,'Koncord','Reginald','Bustos',1,'1889-05-10','9123232402','jmgcacao@gmail.com','173, S.Santiago, Koalangpot','2025-04-12',213,'2025-05-22 06:48:52',NULL,NULL,NULL,2,2,2,NULL),(145,'Limmy','Rettinate','John Sivers',2,'1997-05-10','9123232402','jmgcacao@gmail.com','12, 21, 21','2025-04-12',213,'2025-05-22 06:51:13',NULL,NULL,NULL,1,5,2,NULL),(148,'Cacao','Martin','Jose',1,'1998-05-15','9123232402','jmgcacao@gmail.com','173, Atoewr, Dsda','1',1,'2025-05-22 07:23:31',NULL,NULL,NULL,2,4,2,NULL),(151,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 04:51:44','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900074.jpg','request_images/request_1747975900074.jpg',NULL,1,4,2,NULL),(152,'Testing','Testing','Testing',1,'2010-05-07','9493396268','mulufulu00@gmail.com','11, 11, 11','Control NUmber',1,'2025-05-23 04:51:44','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747975900644.jpg','request_images/request_1747975900644.jpg',NULL,1,4,2,NULL),(161,'Pomasin','Tena','David',1,'2025-05-09','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','1',1,'2025-05-23 05:52:17',NULL,NULL,NULL,3,3,2,NULL),(162,'Pomasin','Tena','David Jonathan',1,'2005-05-12','9669332569','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-23 05:53:16',NULL,NULL,NULL,1,5,2,NULL),(188,'Mabborang','Pasturan','Renmar',1,'2004-10-14','9493396268','renmarjo@gmail.com','1889, Skibidi, Courttail','1',1,'2025-05-22 04:01:27',NULL,NULL,NULL,3,5,2,NULL),(189,'Garcia','Mannik-Fam','Joshua',1,'1887-05-06','9493396268','cacaojosemartin@yahoo.com.ph','123, 2, 523','12',1,'2025-05-22 07:44:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1747899868979.jpg','request_images/request_1747899868979.jpg',NULL,4,4,2,NULL),(190,'Coppola','Friedman','Dimble',1,'1998-05-16','9123232402','jmgcacao@gmail.com','12, Dsda, Dsda','2025-04-12',213,'2025-05-22 07:02:47',NULL,NULL,NULL,2,1,2,NULL),(191,'1','1','1',1,'2015-05-14','9493396268','mulufulu00@gmail.com','11, 11, 11','bai na bai',1,'2025-05-23 07:04:01',NULL,NULL,NULL,1,5,2,NULL),(192,'Please','Please','Please',1,'2015-05-01','9493396268','jayqjek26@gmail.com','1, 357 S. Fernando, 1','1',1,'2025-05-23 08:42:51',NULL,NULL,NULL,1,5,2,'2025-0001'),(193,'Gaguis','Andrei','Jayq',1,'2019-05-17','9493396268','mulufulu00@gmail.com','1, 357 S. Fernando, 1','bai na bai',1,'2025-05-23 09:15:09',NULL,NULL,NULL,1,5,2,'2025-0002'),(194,'1','1','1',1,'2016-05-12','9493396268','mulufulu00@gmail.com','1, 1, 1','1',1,'2025-05-23 09:43:10',NULL,NULL,NULL,1,5,2,'2025-0003'),(195,'Gaguis','Andrei','Jayq',1,'2016-05-13','9493396268','jayqjek26@gmail.com','1, 357 S. Fernando, 1','1',1,'2025-05-23 09:45:35',NULL,NULL,NULL,1,5,2,'2025-0004'),(196,'1','1','1',1,'2017-05-18','9493396268','jayqjek26@gmail.com','1, 1, 1','1',1,'2025-05-23 10:48:03',NULL,NULL,NULL,1,5,2,'2025-0005'),(199,'Pangtestingniangelus','Pangtestingniangelus','Pangtestingniangelus',1,'2003-05-10','9876543241','pangtest@gmail.com','1, 2, 3','pangtesting',3,'2025-05-23 12:12:20',NULL,NULL,NULL,1,3,1,NULL),(201,'Burnok','Saint','Quiboloy',1,'2001-05-17','9669332659','yajucourtside@gmail.com','12, EScuella, Sitio','Late',1,'2025-05-23 12:25:49',NULL,NULL,NULL,1,5,2,'2025-0006'),(202,'Bean','Kobe','Bryant',1,'1998-05-08','9669332659','yajucourtside@gmail.com','12, Piccolo, Piccolo','12345',1,'2025-05-23 12:30:52',NULL,NULL,NULL,1,5,2,'2025-0007'),(203,'Junnie','Melon','Favors',1,'1998-05-11','9669332659','yajucourtside@gmail.com','12, Escuella, Purok','1',1,'2025-05-23 12:53:38',NULL,NULL,NULL,1,1,2,'2025-0001'),(208,'Lomo','Jenkie','Cashman',1,'1899-05-12','9669332659','davipomasinsp@gmail.com','13, Guyabano, 41','1',1,'2025-05-23 13:33:46',NULL,NULL,NULL,3,5,2,'2025-0008'),(209,'Bonky','Hopper','CHompy',1,'1899-05-08','9669332659','yajucourtside@gmail.com','12, 31, Purok','1',1,'2025-05-23 13:43:09',NULL,NULL,NULL,2,1,2,'2025-0003'),(210,'John','Van Damme','Claude',1,'1778-05-07','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','1',1,'2025-05-23 13:50:22',NULL,NULL,NULL,1,1,2,'2025-0005'),(211,'Jayver','Andrei','Jay Jay',1,'2025-05-07','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','1',1,'2025-05-23 14:16:07',NULL,NULL,NULL,1,1,2,'2025-0004'),(212,'John','Van Damme','Jay Jay',1,'2025-05-07','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-23 14:17:08','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748009825505.jpg','request_images/request_1748009825505.jpg',NULL,1,4,2,'2025-0001'),(214,'KIng','Tena','Jaylen',1,'2025-05-09','9669332569','davidpomasinsp@gmail.com','1, 1, 1','1',1,'2025-05-23 14:44:31','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748011469460.jpg','request_images/request_1748011469460.jpg',NULL,2,4,2,'2025-0001'),(217,'Jayver','Andrei','Claude',4,'1778-05-06','9669332659','davipomasinsp@gmail.com','12, EScuella, Purok','1',1,'2025-05-24 06:07:33','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748066851972.jpg','request_images/request_1748066851972.jpg','Sixty',2,4,2,'2025-0003'),(218,'Gaguis','Andrei','Jayq',1,'2020-05-07','9493396268','mulufulu00@gmail.com','1, 1, 1','11',1,'2025-05-23 16:59:26','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748019561278.jpg','request_images/request_1748019561278.jpg',NULL,1,4,2,NULL),(219,'James','Jade','Quincy',1,'1996-05-10','9669332659','yajucourtside@gmail.com','1734, Escuella, Piccolo','Late',1,'2025-05-23 13:32:12',NULL,NULL,NULL,1,1,1,NULL),(221,'All i wanna see is diamonds','Shut your mouth','My mind gets',1,'1998-05-06','9669332659','yajucourtside@gmail.com','12, Escuella, Purok','Late',1,'2025-05-24 11:17:21','https://barangay-events-images.s3.ap-southeast-1.amazonaws.com/request_images/request_1748085437697.jpg','request_images/request_1748085437697.jpg',NULL,1,4,2,'2025-0002'),(222,'Limmy','Rettinate','John Sivers',2,'1997-05-10','9123232402','jmgcacao@gmail.com','12, 21, 21','2025-04-12',213,'2025-05-22 06:51:13',NULL,NULL,NULL,1,5,1,NULL);
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sex_options`
--

DROP TABLE IF EXISTS `sex_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sex_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `requires_input` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sex_options`
--

LOCK TABLES `sex_options` WRITE;
/*!40000 ALTER TABLE `sex_options` DISABLE KEYS */;
INSERT INTO `sex_options` VALUES (1,'Male',0),(2,'Female',0),(3,'Prefer not to say',0),(4,'Other',1);
/*!40000 ALTER TABLE `sex_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suffixes`
--

DROP TABLE IF EXISTS `suffixes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suffixes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suffixes`
--

LOCK TABLES `suffixes` WRITE;
/*!40000 ALTER TABLE `suffixes` DISABLE KEYS */;
INSERT INTO `suffixes` VALUES (1,'None'),(2,'Jr.'),(3,'Sr.'),(4,'I'),(5,'II'),(6,'III'),(7,'IV'),(8,'V');
/*!40000 ALTER TABLE `suffixes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-24 23:00:57
