const express = require("express");
const router = express.Router();
const path = require("path");
require("dotenv").config()

router.use(express.static(path.join(__dirname, 'public')));

//delete a subject
router.get("/delete/:edpcode",(req,res)=>{
	let edpcode = req.params.edpcode;
	let subject = ""

	//get name of user deleted
	let usersql = `SELECT * FROM subject WHERE edpcode = '${edpcode}'`
	db.query(usersql,(err,result)=>{
		if(err){
			console.log(err)
		}
		else{
			subject = result[0].edpcode +" "+ result[0].subjectcode +" "+ result[0].time +" "+ result[0].days;
		}
	})

	let sql = "DELETE FROM `subject` WHERE `edpcode`= ? ";
	
	db.query(sql,edpcode,(err,results,fields)=>{
		if(err){
			message = "Subject not found, delete aborted";
			res.redirect("/subjectslist");
		}
		else{
			message = `Subject "${subject}" successfully deleted`;
			res.redirect("/subjectslist");
		}
	})
});

//create a route to display all records
router.get("/",function(req,res){
	if(req.session.user){
		var sql = "SELECT * FROM `subject`";
		db.query(sql,function(err,results,fields){
			if (err) {
				res.status(500).json("Query Error");
			}
			else {
				header=['edp#','subjcode','time-day','room','action'];
				size=[5,10,15,20];
				res.render("subject.ejs",{message:message, header:header, subjects:results, size:size} );
				message = "";
			}
		});
	}
	else{
		message = "Login properly";
		res.redirect("/");
	}
});

//edit
router.post("/update", function(req, res) {
	const edpcode = req.body.edpcode;
	const subjectcode = req.body.subjectcode;
	const time = req.body.time;
	let days = "";
	if(typeof req.body.days === "object"){
		days = req.body.days.join('');
	}
	else days = req.body.days;
	const room = req.body.room;

	//update the new student into the database
	const sql = 
	`
	UPDATE subject
	SET
		subjectcode = '${subjectcode}', 
		time = '${time}', 
		days = '${days}'
		room = '${room}'
	WHERE 
		edpcode = '${edpcode}' 
	`
	db.query(sql,(err,result)=>{
		if(err){
			message = "Insertion error: " + err.message
            res.redirect("/")
		}
		message = `Successfully edited edpcode: "${edpcode}"`
		res.redirect("/subjectslist");
	})
})

//add/edit new subject
router.post("/", function(req, res) {
	const edpcode = req.body.edpcode;
	const subjectcode = req.body.subjectcode;
	const time = req.body.time;
	let days = "";
	if(typeof req.body.days === "object"){
		days = req.body.days.join('');
	}
	else days = req.body.days;

	const room = req.body.room;

    //Insert the new student into the database
	const sql = 
	`
	INSERT INTO subject (edpcode, subjectcode, time, days, room)
	VALUES (
		'${edpcode}',
		'${subjectcode}', 
		'${time}', 
		'${days}',
		'${room}'
	)
	`
	
    db.query(sql, function(err, result) {
        if (err) {
			message = "Insertion error: idno is already taken"
            res.redirect("/");
        }
		message = `Successfully added subject: "${edpcode} ${subjectcode} ${time} ${days}"`
		res.redirect("/subjectslist");
    });
});






module.exports = router