
interactApp.service('Database', function ($cordovaSQLite, $q, $log){
  var questionset = {};
  this.insertQuestionSet = function(id, data, questionnaire_id){
    console.log(questionnaire_id);
    var query = 'INSERT INTO questionsets (questionset_id, questionset, questionnaire_id, sortid) VALUES (?,?,?,?)';
    $cordovaSQLite.execute(databaseHandler, query, [id, JSON.stringify(data), questionnaire_id, data.sortid]).then(function(res) {}, function (err) {
      $log.error('insertQuestionSet');
      $log.error(err);
    });
  };
  this.insertAnswer = function(data, questionnaire_id, questionset_id, section_id){
    var query ='INSERT INTO answers (answer, questionnaire_id, questionset_id, section_id) VALUES (?,?,?,?)';
    $cordovaSQLite.execute(databaseHandler, query, [JSON.stringify(data), questionnaire_id, questionset_id, section_id]).then(function(res) {
    }, function (err) {
      $log.error('Insert Answer');
      $log.error(err);
    });
  };
  this.insertQuestionnaire = function(id, runid, object, sticky, started, toShow){
    var query = 'INSERT INTO questionnaire (unique_id, runid, object, sticky, started, toShow) VALUES (?,?,?,?,?,?)';
    $cordovaSQLite.execute(databaseHandler, query, [id, JSON.stringify(runid), JSON.stringify(object), sticky, started, toShow]).then(function(res) {}, function (err) {
      $log.error('Insert Questionnaire');
      $log.error(err);
    });
  };

  this.getAllQuestionaires = function(){
    var query = 'SELECT * FROM questionnaire WHERE toShow = 1';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query).then(function(res) {
      var notStarted = [], inProgress = [];
      for( var x = 0; x < res.rows.length; x++){
        if(res.rows.item(x).started === 0){
          notStarted.push({
            unique_id:res.rows.item(x).unique_id,
            runid:JSON.parse(res.rows.item(0).runid),
            object:JSON.parse(res.rows.item(0).object),
            num_of_questions:JSON.parse(res.rows.item(0).object).num_of_questions,
            name:JSON.parse(res.rows.item(0).object).name,
            num_of_questionsets:JSON.parse(res.rows.item(0).object).num_of_questionsets,
            sticky:res.rows.item(0).sticky
          });
        } else {
          inProgress.push({
            unique_id:res.rows.item(x).unique_id,
            runid:JSON.parse(res.rows.item(0).runid),
            object:JSON.parse(res.rows.item(0).object),
            num_of_questions:JSON.parse(res.rows.item(0).object).num_of_questions,
            name:JSON.parse(res.rows.item(0).object).name,
            num_of_questionsets:JSON.parse(res.rows.item(0).object).num_of_questionsets,
            sticky:res.rows.item(0).sticky
          });
        }
      }
      var result = {in_progress:inProgress, not_started:notStarted};
      promise.resolve(result);
    }, function (err) {
      $log.error('getAllQuestionaires');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.getAllQuestionsetByQuestionnaireId = function(id){
    console.log(id);
    var query = 'SELECT * FROM questionsets WHERE questionnaire_id = ? ORDER BY sortid ASC';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      console.log(res);
      promise.resolve(JSON.parse(res.rows.item(0).object));
    }, function (err) {
      $log.error('getAllQuestionsetByQuestionnaireId');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.getAllAnswers = function(){
    var query = 'SELECT * FROM answers INNER JOIN questionnaire ON questionnaire.unique_id = answers.questionnaire_id';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query).then(function(res) {
      console.log('group by result');
      console.log(res);
      var array = [];
      for( var x = 0; x < res.rows.length; x++){
        array.push({
          data:JSON.parse(res.rows.item(x).answer),
          questionnaire_id:res.rows.item(x).questionnaire_id,
          id:res.rows.item(x).answer_id,
          runid:JSON.parse(res.rows.item(x).runid),
          sticky:res.rows.item(x).sticky,
          questionset_id:res.rows.item(x).questionset_id,
          object:JSON.parse(res.rows.item(x).object),
          section_id:res.rows.item(x).section_id
        });
      }
      promise.resolve(array);
    }, function (err) {
      $log.error('getAllAnswers');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };

  this.getQuestionsetBySectionId = function(id) {
    console.log(id);
    var query = 'SELECT * FROM questionsets WHERE sortid = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      console.log(res.rows.item(0));
      console.log(res.rows.item(0).questionset);
      promise.resolve(JSON.parse(res.rows.item(0).questionset));
    }, function (err) {
      $log.error('getAllQuestionsetByQuestionnaireId');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };

  this.getQuestionnaireById = function(id, num){
    var query = 'SELECT * FROM questionnaire WHERE unique_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      var result = {res:{}, num:num};
      if(res.rows.length > 0){
        result.res.id = res.rows.item(0).id;
        result.res.runid = JSON.parse(res.rows.item(0).runid);
        result.res.object = JSON.parse(res.rows.item(0).object); 
      }
      $log.error(result);
      promise.resolve(result);
    }, function (err) {
      $log.error('getQuestionnaireById');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.getQuestionsetById = function(id){
    var query = 'SELECT * FROM questionsets WHERE id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      var result = {};
      if(res.rows.length > 0){
        result.id = res.rows.item(0).questionset_id;
        result.object = JSON.parse(res.rows.item(0).object);
        result.questionnaire_id = res.rows.item(0).questionnaire_id;
        result.reviewer_name = res.rows.item(0).reviewer_name;
      }
      promise.resolve(result);
    }, function (err) {
      $log.error('getQuestionsetById');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };

  this.updateQuestionset = function(id, data, questionnaire_id){
    var query = 'UPDATE questionsets SET questionset = ?, questionnaire_id = ? WHERE questionset_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [JSON.stringify(data), questionnaire_id, id]).then(function(res) {
    }, function (err) {
      $log.error('updateQuestionset');
      promise.reject(err);
    });
    return promise.promise;
  };
  this.updateSectionQuestionnaire = function(unique_id, data){
    var query = 'UPDATE questionnaire SET object = ? WHERE unique_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [JSON.stringify(data), unique_id]).then(function(res) {
    }, function (err) {
      $log.error('updateSectionQuestionnaire');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.updateQuestionnaire = function(id, runid, object, started){
    var query = 'UPDATE questionnaire SET runid = ?, object = ?, started = ? WHERE unique_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [JSON.stringify(runid), JSON.stringify(custom_branding), JSON.stringify(object), started, id]).then(function(res) {
    }, function (err) {
      $log.error('updateQuestionnaire');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };

  this.removeQuestionnaire = function(id){
    var query = 'DELETE FROM questionnaire WHERE id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      promise.resolve(res);
    }, function (err) {
      $log.error('removeQuestionnaire');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.removeQuestionset = function(id){
    var query = 'DELETE FROM questionsets WHERE questionset_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      promise.resolve(res);
    }, function (err) {
      $log.error('removeQuestionset');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
  this.removeAnswer = function(id){
    var query = 'DELETE FROM answers WHERE answer_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [id]).then(function(res) {
      promise.resolve(res);
    }, function (err) {
      $log.error('removeAnswer');
      promise.reject(err);
    });
    return promise.promise;
  };

  this.emptyQuestionniare = function(){
    var query = 'DELETE FROM questionnaire';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query).then(function(res) {
    }, function (err) {
      $log.error('emptyQuestionniare');
      promise.reject(err);
    });
    return promise.promise;
  };
  this.emptyQuestionset = function(){
    var query = 'DELETE FROM questionnaire';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query).then(function(res) {
    }, function (err) {
      $log.error('emptyQuestionniare');
      promise.reject(err);
    });
    return promise.promise;
  };

  this.hideQuestionnaire = function(id, hide){
    var query = 'UPDATE questionnaire SET toShow = ? WHERE unique_id = ?';
    var promise = $q.defer();
    $cordovaSQLite.execute(databaseHandler, query, [hide, id]).then(function(res) {
      promise.resolve();
    }, function (err) {
      $log.error('hideQuestionnaire');
      $log.error(err);
      promise.reject(err);
    });
    return promise.promise;
  };
});