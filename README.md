An api to interact with the AS400.  
    
Routes:  

/api/employeeLogin  
/api/setMachine  
/api/setup  
/api/run  
/api/pause  
/api/resume  
/api/goodPieces  
/api/scrapPieces  
/api/getMachineJobs  
/api/checkCurrentJob  
/api/checkJob  

Params:  

/api/employeeLogin  

+--------+-------------------+  
| param  | description       |  
+--------+-------------------+  
| id     | The employee code |  
+--------+-------------------+  

/api/setMachine  

+----------+-------------------+  
| param    | description       |  
+----------+-------------------+  
| dept     | The department    |  
| resource | The resource      |  
| employee | The employee code |  
+----------+-------------------+  

/api/setup  

+----------+----------------------+  
| param    | description          |  
+----------+----------------------+  
| dept     | The department       |  
| resource | The resource         |  
| jobs     | Job array of objects |  
| employee | employee code        |  
+----------+----------------------+  

/api/run  

+----------+----------------------+  
| param    | description          |  
+----------+----------------------+  
| dept     | The department       |  
| resource | The resource         |  
| jobs     | Job array of objects |  
| employee | employee code        |  
+----------+----------------------+  

/api/pause  

+----------+----------------+  
| param    | description    |  
+----------+----------------+  
| dept     | The department |  
| resource | The resource   |  
+----------+----------------+  

/api/resume  

+----------+----------------+  
| param    | description    |  
+----------+----------------+  
| dept     | The department |  
| resource | The resource   |  
+----------+----------------+  

/api/goodPieces  

+------------+----------------------+  
| param      | description          |  
+------------+----------------------+  
| dept       | The department       |  
| resource   | The resource         |  
| jobs       | Job array of objects |  
| employee   | employee code        |  
| quantities | Array of Integers    |  
+------------+----------------------+  

/api/scrapPieces  

+----------+----------------+  
| param    | description    |  
+----------+----------------+  
| dept     | The department |  
| resource | The resource   |  
| job      | Job object     |  
| employee | employee code  |  
| quantity | Integer        |  
| code     | Code of scrap  |  
+----------+----------------+  

/api/checkJob  

+----------+----------------+  
| param    | description    |  
+----------+----------------+  
| dept     | The department |  
| resource | The resource   |  
| job      | Job string     |  
+----------+----------------+  

/api/checkCurrentJob  

+----------+----------------+  
| param    | description    |  
+----------+----------------+  
| dept     | The department |  
| resource | The resource   |  
| job      | Job string     |  
| seq      | Seq integer    |  
+----------+----------------+  

