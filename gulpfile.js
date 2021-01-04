///////////////////////////////// USAGE /////////////////////////////////

/*
    SETUP:
    
    step 1:
        start by installing node and getting it into a good space. test by trying `npm --version`. if you get a version then you are good

    step 2:
        edit the packages.json file to include your dependencies. ie:
        "dependencies": {
            "@fortawesome/fontawesome-free": "^5.14.0",
            "bootstrap": "^4.5.2",
            "jquery": "^3.5.1"

    step 3:
        run `npm install` to install the "build tooling" plugins ("devDependencies") and get the "dependencies"
        this istalls everything to a "node_modules" folder in the root. 

        MAKE SURE YOU ADD node_modules TO YOUR .gitignore file. DONT INCLUDE THE FOLDER IN THE REPO!!!!!!!!

    step 4:
        run `gulp --version` to make sure gulp is working

    step 5:
        edit the gulp file to include the dependencies you wish to add in the relevant places (javascript / style / files etc)

    USAGE:

    to run everything use `gulp build`
    to only do the javascript files `gulp javascript` 

    make sure to add the computed files to your version control


*/


///////////////////////////////// YOUR FILES /////////////////////////////////

// ALL DEST FOLDERS WILL BE CREATED FOR YOU SO YOPU DONT NEED TO CREATE THEM BEFOREHAND

/*
    Setting up the javascript files to merge here. all paths are from the root. (where this file is)
    dest: path and file name for where you want the file to go after its concated
    src: a list of files to "merge". order matters
*/
const javascripts = [
    {
        "dest":"./dist/libraries.js",
        "src": [
            "./node_modules/jquery/dist/jquery.min.js",
            "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
        ]
    },
    {
        "dest":"./dist/custom.js",
        "src": [
            "./src/cust.js",
        ]
    },
    {
        "dest":"./dist/te/custom.js",
        "src": [
            "./src/cust.js",
        ]
    },
    {
        "dest":"./dist/te/he/custom.js",
        "src": [
            "./src/cust.js",
        ]
    }
];



/*
    Setting up the style files to merge here. all paths are from the root. (where this file is)
    dest: path and file name for where you want the file to go after its concated. notice the .css extention. this will output the scss files into css
    src: a single scss file that has @imports in it
*/
// THE SRC HERE IS A STRING NOT A LIST. YOU DO THE CONCAT STUFF IN THE SCSS FILE
const styles = [
    {
        "dest":"./dist/libraries.css",
        "src": "./src/libraries.scss"
    }
];


/*
    copy all the files in the src  to the dest. to include just a single file put the file name in, to include all the files in the folder use a wildcard. see node glob documentation
    dest: destination folder for the file to go into (FOLDER)
    src: node glob spec for files or folders
*/
// THE DEST MUST BE THE TO THE FOLDER YOU WANT THE FILES TO GO INTO
// DONT END THE DEST WITH A / JUST END IT ON THE FOLDER NAME
const files = [
    {
        "dest":"dist/fonts",
        "src": "node_modules/@fortawesome/fontawesome-free/webfonts/*"
    }
];


/*
    When running "gulp build" which folders / files do you want to delete first. like removing the dist folder etc
    this is just a list of files OR folders
*/
// THIS WILL DELETE THESE FILES and FOLDERS - BE CAREFUL
const clean = [
    "./dist"
];
/* usage could look like this
const clean = [
    "./dist", - deletes the dist folder
    "./dist/fonts/*" - deletes all the files inside the dist/fonts folder but keeps the fonts folder
    "./dist/fonts/test.ttf" - deletes just the file
];

*/


///////////////////////////////// SYSTEM STUFF NOW /////////////////////////////////

/* Setting up the libraries needed */
var gulp = require('gulp');
var sass = require('gulp-dart-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var path = require('path');
var tap = require("gulp-tap")
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var run = require('gulp-run-command').default;
var del = require('del');
const sourcemaps = require('gulp-sourcemaps');

sass.compiler = require('dart-sass');


///////////////////////////////// DEFINING GULP TASKS /////////////////////////////////
/* 
    To run any of these tasks its `gulp task_name` (ie: gulp javascript)
*/

// This tasdk takes the javascript const above and turns the src files into the dest file
gulp.task('javascript', (cb) => {
    javascripts.map( function (item) {
        // we just turning the slashes in the path into something the system can understand 
        let dest = item['dest'].replace(/\//g,path.sep).replace(/\\/g,path.sep)
        let src = item['src'].map(function(src_file){
            return src_file.replace(/\//g,path.sep).replace(/\//g,path.sep)
        });
        return gulp.src(src, { base: "." })
            .pipe(concat(path.parse(dest).name, { newLine: '\n\r;/*********************************/;\n\r' }))
            .pipe(rename(function (file) {
                file.dirname = path.dirname(dest)
                file.basename = path.basename(dest)
                console.log(" > " + file.dirname + path.sep + file.basename + file.extname);
            }))
            // MINIFY [
            .pipe(minify({
                ext: {
                    min: '.js' // Set the file extension for minified files to just .js
                },
                preserveComments: 'some',
                noSource: true // Don't output a copy of the source file
            }))
            // ] MINIFY
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
    });
    cb();
});

gulp.task('style', (cb) => {
    styles.map( function (item) {
        // we just turning the slashes in the path into something the system can understand 
        let dest = item['dest'].replace(/\//g,path.sep).replace(/\\/g,path.sep);
        let src = item['src'].replace(/\//g,path.sep).replace(/\\/g,path.sep);
        return gulp.src(src, { base: '.' })
            .pipe(sass().on('error', sass.logError))
            .pipe(rename(function (file) {
                file.dirname = path.dirname(dest)
                file.basename = path.parse(dest).name


                console.log(" > " + file.dirname + path.sep + file.basename + path.parse(dest).ext)
            }))
            // AUTOPREFIXER [
            .pipe(autoprefixer({
                cascade: false
            }))
            // ] AUTOPREFIXER
            // MINIFY [
            .pipe(cleanCSS())
            // ] MINIFY
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
    });
    cb();
});

gulp.task('files', (cb) => {
    files.map( function (item) {
        let dest = item['dest'].replace(/\//g,path.sep).replace(/\\/g,path.sep);
        let src = item['src'].replace(/\//g,path.sep).replace(/\\/g,path.sep);
        return gulp.src(src, { nodir: true, base: '.' })
            .pipe(rename(function (file) {
                file.dirname = dest
                console.log(" > " + file.dirname + path.sep + file.basename + file.extname)
            }))
            .pipe(gulp.dest("."));
    });
    cb();
})

gulp.task('clean', (cb) => {
    clean.map( function (item) {
        let dest = item.replace(/\//g,path.sep).replace(/\\/g,path.sep);
        return del(dest, {force:true},function(file){
                console.log(file)
            });
    });
    cb()
});

gulp.task('update', async () => run('npm update"')());

gulp.task('build', gulp.series('clean', 'javascript', 'style', 'files'));

