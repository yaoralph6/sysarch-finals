const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config()

router.use(express.static(path.join(__dirname, 'public')));

//delete a student
router.get("/delete/:idno",(req,res)=>{
	let id = req.params.idno;
	let user = ""

	//get name of user deleted
	let usersql = `SELECT * FROM student WHERE idno = '${id}'`
	db.query(usersql,(err,result)=>{
		if(err){
			console.log(err)
		}
		else{
			user = result[0].idno +" "+ result[0].firstname +" "+ result[0].lastname;
		}
	})

	let sql = "DELETE FROM `student` WHERE `idno`= ? ";
	
	db.query(sql,id,(err,results,fields)=>{
		if(err){
			message = "User not found, delete aborted";
			res.redirect("/");
		}
		else{
			message = `user "${user}" successfully deleted`;
			res.redirect("/");
		}
	})
});

//create a route to display all records
router.get("/",function(req,res){
		let student = [], enrolled = [];
		header=['EDPCODE','SUBJECTCODE','TIME','DAY','ROOM'];
		if(req.session.user){
			let sql = "SELECT * FROM `subject`";
			db.query(sql,function(err,results,fields){
				if (err) {
					res.status(500).json("Query Error");
				}
				else {
					let subjects = results;
					res.render("enrollment.ejs",{message:message, header:header, subjects:subjects, student:student, enrolled:enrolled} );
					message = "";
				}
			});
		}
		else{
			message = "Login properly"
			res.redirect("/")
		}
})
.get("/:student",function(req,res){
	let student = [];
	let studId = req.params.student;
	header=['EDPCODE','SUBJECTCODE','TIME','DAY','ROOM'];
	if(req.session.user){
		let sql = `SELECT * FROM subject
					EXCEPT
					SELECT s.id, s.edpcode, s.subjectcode, s.time, s.days, s.room
						from subject s
						inner join enrollment e on e.subject_edpcode = s.edpcode
						inner join student st on st.idno = e.student_idno
						where st.idno = '${studId}'
		`
		db.query(sql,function(err,results,fields){
			if (err) {
				res.status(500).json("Query Error1" + err);
			}
			else {
				let subjects = results;
				for(s in subjects){

				}
				sql = `SELECT * FROM student WHERE idno = '${studId}'`
				db.query(sql,function(err,results){
					if(err){
						res.status(500).json("Query Error2");
					}
					else{
						if(Object.keys(results).length == 0){
							message = "user not found"
						}
						let student = results;
						sql = `SELECT s.edpcode, s.subjectcode, s.time, s.days, s.room
								from subject s
								inner join enrollment e on e.subject_edpcode = s.edpcode
								inner join student st on st.idno = e.student_idno
								where st.idno = '${studId}'
						`
						db.query(sql,function(err,results){
							if(err){
								res.status(500).json("Query Error3");
							}
							else{
								let enrolled = results;
								res.render("enrollment.ejs",{message:message, header:header, subjects:subjects, student:student, enrolled:enrolled} );
								message = "";
							}
						})
					}
				})
			}
		})
	}
	else{
		message = "Login properly"
		res.redirect("/")
	}
})


//save
router.post("/save", function(req, res) {
	const enrolled_by = req.session.user;
	const student_idno = req.body.student_idno;
	const subject_edpcode_arr = JSON.parse(req.body.subject_edpcode_arr);

	//update the new student into the database
	for(let i = 0; i < subject_edpcode_arr.length; i++){
		const sql = 
		`
		START TRANSACTION;
	
		SELECT COUNT(*) INTO @count
		FROM enrollment
		WHERE student_idno = '${student_idno}' AND subject_edpcode = '${subject_edpcode_arr[i]}';
		
		IF @count > 0 THEN
			DELETE FROM enrollment
			WHERE student_idno = '${student_idno}' AND subject_edpcode = '${subject_edpcode_arr[i]}';
		END IF;
		
		INSERT INTO enrollment (enrolled_by, student_idno, subject_edpcode)
		VALUES ('${enrolled_by}', '${student_idno}', '${subject_edpcode_arr[i]}');
		
		COMMIT; 
		`
		db.query(sql,(err,result)=>{
			if(err){
				message = "Insertion error: " + err.message
				res.redirect("/")
			}
			message = `Successfully edited IDNO: "${student_idno}"`
		})
	}
	res.redirect(`/enrollmentslist/${student_idno}`);
})

//add/edit new student
router.post("/", function(req, res) {
	const idno = req.body.idno;
	const lastname = req.body.lastname;
	const firstname = req.body.firstname;
	const course = req.body.course;
	const level = req.body.level;

    //Insert the new student into the database
	const sql = 
	`
	INSERT INTO student (idno, lastname, firstname, course, level)
	VALUES (
		'${idno}',
		'${lastname}', 
		'${firstname}', 
		'${course}',
		'${level}'
	)
	`
	
    db.query(sql, function(err, result) {
        if (err) {
			message = "Insertion error: idno is already taken"
            res.redirect("/");
        }
		message = `Successfully added user: "${idno} ${firstname} ${lastname}"`
		res.redirect("/");
    });
});






module.exports = router