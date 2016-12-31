var Promise = require("bluebird");
var mongoose = Promise.promisifyAll(require('mongoose'));
var credential = require('credential');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/demo');

var userSchema = new mongoose.Schema({
  username : {
      type : String,
      required : true
  },
  name : {
    type : String,
    required : true
  },
  password : {
    type : String,
    required : true
  },
  email : {
    type : String,
    required : true,
    unique : true
  },
  contact : {
    type : String,
    required : true
  },
  role : {
    type : Number,
    defaultValue : 2
  }
});


module.exports.user = mongoose.model('user',userSchema);

module.exports.book = mongoose.model('book',{
  author_name : {
      type : String,
      required : true
  },
  name : {
    type : String,
    required : true
  },
  availability : {
    type : Boolean,
    required : false,
    defaultValue : true
  },
  isbn : {
    type : String,
    required : true
  }
});

var transactionSchema = new mongoose.Schema({
    user_id : {
        type : Schema.Types.ObjectId,
        required : true
    },
    book_id : {
      type : Schema.Types.ObjectId,
      required : true
    },
    issue_date : {
      type : Date,
      required : false
    },
    due_date : {
      type : String,
      required : false
    },
    returned_date : {
      type : String,
      required : false
    },
    type : {
      type : String,
      defaultValue : "issue"
    }
});

module.exports.transaction = mongoose.model('transaction', transactionSchema);
