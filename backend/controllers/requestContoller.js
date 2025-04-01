const pool = require("../config/db");

const backupRequest = async (requestData) => {
  try {
      await pool.execute(
          `INSERT INTO backup_requests 
           (last_name, first_name, middle_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies, original_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              requestData.last_name, requestData.first_name, requestData.middle_name, 
              requestData.suffix, requestData.sex, requestData.birthday, requestData.contact_no, 
              requestData.email, requestData.address, requestData.type_of_certificate, 
              requestData.purpose_of_request, requestData.number_of_copies, requestData.id
          ]
      );
      console.log("✅ Backup request inserted successfully");
  } catch (error) {
      console.error("❌ Request backup failed:", error);
  }
};


exports.createRequest = async (req, res) => {
  const { lastName, firstName, middleName, suffix, sex, birthday, contactNo, email, address, type_of_certificate, purpose_of_request, number_of_copies } = req.body;

  try {
      const [result] = await pool.execute(
          `INSERT INTO requests 
           (last_name, first_name, middle_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [lastName, firstName, middleName, suffix, sex, birthday, contactNo, email, address, type_of_certificate, purpose_of_request, number_of_copies]
      );

      const requestId = result.insertId;

      await backupRequest({
          id: requestId,
          last_name: lastName,
          first_name: firstName,
          middle_name: middleName,
          suffix,
          sex,
          birthday,
          contact_no: contactNo,
          email,
          address,
          type_of_certificate,
          purpose_of_request,
          number_of_copies
      });

      res.status(201).json({ message: "Request submitted successfully" });
  } catch (error) {
      console.error("❌ Database error:", error);
      res.status(500).json({ message: "Database error", error });
  }
};

exports.getRequests = async (req, res) => {
  try {
      const [rows] = await pool.query(`
          SELECT * FROM requests 
          ORDER BY created_at DESC
      `);
      res.status(200).json(rows);
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
};

