/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var TODO_FILE = path.join(__dirname, 'todoitems.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/todoitems', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.post('/api/todoitems', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todoitems = JSON.parse(data);

    // Jos tuli teksti mutta ei id:tä, tallennetaan uusi
    if (req.body.text != null) {
      // NOTE: Pitäisi tehdä hianommin kun Date.now():lla ja .jsonilla
      var newTodoitem = {
        id: Date.now(),
        text: req.body.text,
        done: false
      };
      todoitems.push(newTodoitem);
    }

    // Jos tuli id mutta ei tekstiä etsitään item ja vaihdetaan tilaa
    if (req.body.id != null && req.body.text == null) {
      var id = req.body.id;
      todoitems.forEach((item) => {
        if(item.id == id) {
          item.done = item.done ? false : true;
        }
      });
    }

    fs.writeFile(TODO_FILE, JSON.stringify(todoitems, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(todoitems);
    });
  });
});

app.delete('/api/todoitems', function(req, res) {
  fs.readFile(TODO_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todoitems = JSON.parse(data);

    var id = req.body.id;

    var returnArray = [];
    todoitems.forEach((item) => {
      if(!item.done) {
        returnArray.push(item);
      }
    });

    fs.writeFile(TODO_FILE, JSON.stringify(returnArray, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.json(returnArray);
    });
  });
});



app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
