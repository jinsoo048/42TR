let express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');


//cookie
const app = require('express')();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', 'views');

var session = require("express-session");
let {type} = require("mysql/lib/protocol/packets/Field");
app.use(session({
    secret: "node-session",
    resave: false,
    saveUninitialized: true
}))


let employeeID;
let projectID;


// display task page
router.get('/', function (req, res, next) {
    dbConn.query('SELECT * FROM task ORDER BY taskID desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/works/index.ejs
            res.render('works', {data: ''});
        } else {
            // render to views/works/index.ejs
            res.render('works', {data: rows});
        }
    });
});

// display add task page
router.get('/add/(:projectID)', function (req, res, next) {
    // render to add.ejs
    res.render('works/add', {
        taskID: '',
        employeeID: '',
        taskBegin: '',
        taskEnd: '',
        estimatedTime: '',
        actualTime:'',
        taskDetail: '',
        projectID: req.params.projectID,
        taskTypeID: ''
    })
})

// add a new task
router.post('/add/(:projectID)', function (req, res, next) {

    let taskID = req.body.taskID;
    let employeeID = req.body.employeeID;
    let taskBegin = req.body.taskBegin;
    let taskEnd = req.body.taskEnd;
    let estimatedTime = req.body.estimatedTime;
    let actualTime = req.body.actualTime;
    let taskDetail = req.body.taskDetail;
    let projectID = req.body.projectID;
    let taskTypeID = req.body.taskTypeID;
    let errors = false;

    if (taskDetail.length === 0 || taskTypeID === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and taskDetail and taskTypeID");
        // render to add.ejs with flash message
        res.render('works/add', {
            taskID: taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        })
    }

    // if no error
    if (!errors) {

        var form_data = {
            taskID: taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        }

        // insert query
        dbConn.query('INSERT INTO task SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('works/add', {
                    taskID: form_data.taskID,
                    employeeID: form_data.employeeID,
                    taskBegin: form_data.taskBegin,
                    taskEnd: form_data.taskEnd,
                    estimatedTime: form_data.estimatedTime,
                    actualTime: form_data.actualTime,
                    taskDetail: form_data.taskDetail,
                    projectID: form_data.projectID,
                    taskTypeID: form_data.taskTypeID
                })
            } else {
                req.flash('success', 'Work successfully added');
                res.redirect('/works/taskList/' + projectID);
            }
        })
    }
})

// display edit task page
router.get('/edit/(:taskID)', function (req, res, next) {

    let taskID = req.params.taskID;
    let employeeID = req.session.employeeID;
    let projectID = req.session.projectID;

    dbConn.query('SELECT * FROM task WHERE taskID = ' + taskID, function (err, rows, fields) {
        if (err) throw err

        // if task not found
        if (rows.length <= 0) {
            req.flash('error', 'Work not found with taskID = ' + taskID)
            res.redirect('/works')
        }
        // if task found
        else {
            // render to edit.ejs
            //taskBegin.type = 'datetime-local';
            //taskEnd.type = 'datetime-local';

            res.render('works/edit', {
                title: 'Edit Task',
                taskID: rows[0].taskID,
                employeeID: rows[0].employeeID,
                taskBegin: rows[0].taskBegin,
                taskEnd: rows[0].taskEnd,
                estimatedTime: rows[0].estimatedTime,
                actualTime: rows[0].actualTime,
                taskDetail: rows[0].taskDetail,
                projectID: rows[0].projectID,
                taskTypeID: rows[0].taskTypeID
            })
        }
    })
})

// display edit task page
router.get('/edit_from_myWorkingTask/(:taskID)', function (req, res, next) {

    let taskID = req.params.taskID;
    let employeeID = req.session.employeeID;
    let projectID = req.session.projectID;

    dbConn.query('SELECT * FROM task WHERE taskID = ' + taskID, function (err, rows, fields) {
        if (err) throw err

        // if task not found
        if (rows.length <= 0) {
            req.flash('error', 'Work not found with taskID = ' + taskID)
            res.redirect('/works')
        }
        // if task found
        else {
            // render to edit.ejs
            //taskBegin.type = 'datetime-local';
            //taskEnd.type = 'datetime-local';

            res.render('works/edit_from_myWorkingTask', {
                title: 'Edit Task',
                taskID: rows[0].taskID,
                employeeID: rows[0].employeeID,
                taskBegin: rows[0].taskBegin,
                taskEnd: rows[0].taskEnd,
                estimatedTime: rows[0].estimatedTime,
                actualTime: rows[0].actualTime,
                taskDetail: rows[0].taskDetail,
                projectID: rows[0].projectID,
                taskTypeID: rows[0].taskTypeID
            })
        }
    })
})
// update task data
router.post('/update/:taskID', function (req, res, next) {

    let taskID = req.params.taskID;
    let employeeID = req.body.employeeID;
    let taskBegin = req.body.taskBegin;
    let taskEnd = req.body.taskEnd;
    let estimatedTime = req.body.estimatedTime;
    let actualTime = req.body.actualTime;
    let taskDetail = req.body.taskDetail;
    let projectID = req.body.projectID;
    let taskTypeID = req.body.taskTypeID;
    let errors = false;

    //let taskID = req.params.taskID;
    //let employeeID = req.session.employeeID;



    if (taskDetail.length === 0 || taskTypeID.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and taskDetail and taskTypeID");
        // render to add.ejs with flash message
        res.render('works/edit', {
            taskID: req.params.taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        })
    }

    // if no error
    if (!errors) {
        var form_data = {
            taskID: taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        }
        // update query
        //employeeID = req.session.employeeID;

        dbConn.query('UPDATE task SET ? WHERE taskID = ' + taskID, form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('works/edit', {
                    taskID: req.params.taskID,
                    //taskID: form_data.taskID,
                    employeeID: form_data.employeeID,
                    taskBegin: form_data.taskBegin,
                    taskEnd: form_data.taskEnd,
                    estimatedTime: form_data.estimatedTime,
                    actualTime: form_data.actualTime,
                    taskID: form_data.taskID,
                    taskDetail: form_data.taskDetail,
                    projectID: form_data.projectID,
                    taskTypeID: form_data.taskTypeID
                })
            } else {
                req.flash('success', 'Task successfully updated');
                res.redirect('/works/taskList/' + projectID);
            }
        })
    }
})

// update task data
router.post('/update_from_myWorkingTask/:taskID', function (req, res, next) {

    let taskID = req.params.taskID;
    let employeeID = req.body.employeeID;
    let taskBegin = req.body.taskBegin;
    let taskEnd = req.body.taskEnd;
    let estimatedTime = req.body.estimatedTime;
    let actualTime = req.body.actualTime;
    let taskDetail = req.body.taskDetail;
    let projectID = req.body.projectID;
    let taskTypeID = req.body.taskTypeID;
    let errors = false;

    //let taskID = req.params.taskID;
    //let employeeID = req.session.employeeID;



    if (taskDetail.length === 0 || taskTypeID.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and taskDetail and taskTypeID");
        // render to add.ejs with flash message
        res.render('works/edit', {
            taskID: req.params.taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        })
    }

    // if no error
    if (!errors) {
        var form_data = {
            taskID: taskID,
            employeeID: employeeID,
            taskBegin: taskBegin,
            taskEnd: taskEnd,
            estimatedTime: estimatedTime,
            actualTime: actualTime,
            taskDetail: taskDetail,
            projectID: projectID,
            taskTypeID: taskTypeID
        }
        // update query
        employeeID = req.session.employeeID;

        dbConn.query('UPDATE task SET ? WHERE taskID = ' + taskID, form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('works/edit', {
                    taskID: req.params.taskID,
                    //taskID: form_data.taskID,
                    employeeID: form_data.employeeID,
                    taskBegin: form_data.taskBegin,
                    taskEnd: form_data.taskEnd,
                    estimatedTime: form_data.estimatedTime,
                    actualTime: form_data.actualTime,
                    taskID: form_data.taskID,
                    taskDetail: form_data.taskDetail,
                    projectID: form_data.projectID,
                    taskTypeID: form_data.taskTypeID
                })
            } else {
                req.flash('success', 'Task successfully updated');
                res.redirect('/works/myWorkingTask');
            }
        })
    }
})

// delete task
router.get('/delete/(:taskID)', function (req, res, next) {

    let taskID = req.params.taskID;

    dbConn.query('DELETE FROM task WHERE taskID = ' + taskID, function (err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to task page
            res.redirect('/works')
        } else {
            // set flash message
            req.flash('success', 'Work successfully deleted! taskID = ' + taskID)
            // redirect to task page
            res.redirect('/works')
        }
    })
})


// display add task page
router.get('/login', function (req, res, next) {
    // render to add.ejs
    req.flash('error', "로그인하세요 (테스트 아이디는 휴대번호 뒷번호 4자리입니다");
    res.render('works/login', {
        employeeID: ''
    })
})


// check the employee
router.post('/login', function (req, res, next) {
    let employeeID = req.body.employeeID;
    let errors = false;

    //res.cookie(employeeID, employeeID, option);

    //res.cookie('employeeID', employeeID);
    //res.send('Cookie have been saved successfully');
    req.session.employeeID = employeeID;

    //employeeID = req.params.employeeID
    if (employeeID < 0) {
        errors = true;
        // set flash message
        req.flash('error', "Please enter employeeID!");
        // render to add.ejs with flash message
        res.render('works/login', {
            employeeID: employeeID
        })
    }

    // if no error
    if (!errors) {
        var form_data = {
            employeeID: employeeID
        }

        // select query
        dbConn.query('SELECT employeeName FROM employee where employeeID = ' + employeeID, function (err, rows, fields) {
            if (err) throw err

            // if task not found
            if (rows.length <= 0) {
                req.flash('error', 'Work not found with employeeID = ' + employeeID)
                res.redirect('/works/login')
            }
            // if task found
            else {
                // set flash message
                req.flash('error', rows[0].employeeName + "님 반갑습니다. 프로젝트와 태스크를 관리하는 보드입니다.");
                res.redirect('/works/myBoard')
                //res.render('works/projectList', {
                //})
            }
        })
    }


})

router.get('/myBoard', function (req, res, next) {
    // render to add.ejs
    //req.flash('error', "프로젝트와 태스크를 관리하는 보드입니다.");
    res.render('works/myBoard')
})

router.get('/myOwnProject', function (req, res, next) {
    // render to add.ejs
    //req.flash('error', "프로젝트와 태스크를 관리하는 보드입니다.");
    //res.cookie(employeeID, employeeID);
    //req.session;
    employeeID = req.session.employeeID;

    dbConn.query('SELECT * FROM project WHERE pmEmployeeID = ' +employeeID, function (err, rows) {
        if (err) {
            req.flash('error', err);
            //res.render('works/projectList', {data: ''});
        } else {
            // render to views/works/index.ejs
            req.flash('error', employeeID + "님 현재 소유하고 있는 프로젝트입니다.");
            res.render('works/myOwnProject', {data: rows});
        }
    });


})

router.get('/myWorkingTask', function (req, res, next) {
    // render to add.ejs
    //req.flash('error', "프로젝트와 태스크를 관리하는 보드입니다.");
    let employeeID = req.session.employeeID;
    //let projectName = req.session.projectName;

    dbConn.query('SELECT * FROM task WHERE employeeID =' + employeeID, function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('works/myWorkingTask', {data: ''});
        } else {
            req.flash('error', "The Task(s) for " + employeeID);
            res.render('works/myWorkingTask', {data: rows});
        }
    });
})

router.get('/projectList', function (req, res, next) {
    dbConn.query('SELECT * FROM project ORDER BY projectID desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('works/projectList', {data: ''});
        } else {
            // render to views/works/index.ejs
            res.render('works/projectList', {data: rows});
        }
    });
});


router.post('/projectList', function (req, res, next) {
    let projectID = req.body.projectID;
    let projectName = req.body.projectName;
    let revenu = req.body.revenu;
    let time = req.body.time;
    let begin = req.body.begin;
    let end = req.body.end;
    let customer = req.body.customer;
    let customerAddress = req.body.customerAddress;
    let errors = false;

    dbConn.query('SELECT * FROM project ORDER BY projectID desc', function (err, rows) {

       projectName = req.session.projectName;
        req.flash('error', err);

        // render to views/user/add.ejs
        res.render('works/projectList', {
            projectID: rows.projectID,
            projectName: rows.projectName,
            revenue: rows.revenue,
            time: rows.time,
            begin: rows.begin,
            end: rows.end,
            customer: rows.customer,
            customerAddress: rows.customerAddress

        })
    });
});

router.get('/taskList/(:projectID)', function (req, res, next) {
    let projectID = req.params.projectID;
    let projectName = req.session.projectName;

    dbConn.query('SELECT * FROM task WHERE projectID =' + projectID, function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('works/taskList', {data: ''});
        } else {
            req.flash('error', "The Task(s) from the Project " + projectID);
            res.render('works/taskList', {data: rows});
        }
    });
});


router.post('/taskList/(:projectID)', function (req, res, next) {
    let taskID = req.body.taskID;
    let employeeID = req.body.employeeID;
    let taskBegin = req.body.taskBegin;
    let taskEnd = req.body.taskEnd;
    let estimatedTime = req.body.estimatedTime;
    let actualTime = req.body.actualTime;
    let taskDetail = req.body.taskDetail;
    let projectID = req.body.projectID;
    let taskTypeID = req.body.taskTypeID;
    let errors = false;

    //let employeeID = req.session.employeeID;
    //let projectID = req.session.projectID;


    dbConn.query('SELECT * FROM task WHERE projectID =' + projectID, function (err, rows) {
        req.flash('error', err)
        // render to views/user/add.ejs
        req.flash('error', "The Work(s) from the Project " + req.session.projectName);
        res.render('works/taskList', {
            taskID: rows.taskID,
            employeeID: rows.employeeID,
            taskBegin: rows.taskBegin,
            taskBegin: rows.taskEnd,
            estimatedTime: rows.estimatedTime,
            actualTime: rows.actualTime,
            taskDetail: rows.taskDetail,
            projectID: rows.projectID,
            taskTypeID: rows.taskTypeID
        })
    });
});

module.exports = router;