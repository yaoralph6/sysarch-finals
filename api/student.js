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
	if(req.session.user){
		var sql = "SELECT * FROM `student`";
		db.query(sql,function(err,results,fields){
			if (err) {
				res.status(500).json("Query Error");
			}
			else {
				header=['idno','name','crs-lvl','action'];
				size=[5,10,15,20];
				res.render("school.ejs",{message:message, header:header, students:results, size:size} );
				message = ""
			}
		});
	}
	else{
		message = "Login properly"
		res.redirect("/")
	}
});

//edit
router.post("/update", function(req, res) {
	const idno = req.body.idno;
	const lastname = req.body.lastname;
	const firstname = req.body.firstname;
	const course = req.body.course;
	const level = req.body.level;

	//update the new student into the database
	const sql = 
	`
	UPDATE student
	SET
		lastname = '${lastname}', 
		firstname = '${firstname}', 
		course = '${course}', 
		level = '${level}'
	WHERE 
		idno = '${idno}' 
	`
	db.query(sql,(err,result)=>{
		if(err){
			message = "Insertion error: " + err.message
            res.redirect("/")
		}
		message = `Successfully edited IDNO: "${idno}"`
		res.redirect("/");
	})

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