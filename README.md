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


Description:

/api/employeeLogin  

Sets the employee status to active on the mysql server.

/api/setMachine

Logs the resource as active, (10000) sets it to down, (10100) and logs in the employee (20000)

/api/setup  

makes sure the resource is running (10000 if necessary) and logs the jobs as setup (10051)

/api/run  

makes sure the resource is running (10000 if necessary) and logs the jobs as run (10151)

/api/pause  

makes sure the resource is running (10000 if necessary) and then pauses the job (10100)

/api/resume  

makes sure the resource is in down and then resumes the job (10101)

/api/goodPieces  

makes sure the resource is running (10000 if necessary), runs the jobs (10151) and then scans good pieces on the jobs (40005)

/api/scrapPieces  

makes sure the resource is running (10000 if necessary), runs the job (10151) and then scans scrap pieces on the job (41000)

/api/getMachineJobs  

returns a json obj of all jobs on the mysql server

/api/checkCurrentJob  

Gets the most up-to-date info on a job

/api/checkJob  

Makes sure that the job exists

