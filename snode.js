var express = require('express');
var app = express();

var hourMs = 1000*60*60;
  
var directory = '/';
  
var pkgcloud = require('pkgcloud');

var client = 
  pkgcloud.storage.createClient(
    {
    provider: 'openstack',
    username: 'XXXX',
    password: 'XXXX',
    authUrl: 'http://X.X.X.X:Y/',
    region: '',
    tenant: ''
    });

client.fs = 
  {
  type : 'directory',
  contents : {}
  };

client.findfile =
  function(path)
    {
    var parts = path.split('/');
    
    var result = this.fs;
    
    for(var i in parts)
      {
      var part = parts[i];
      
      if(part)
        result = result.contents[part];
        
      if(!result)
        return undefined;
      }
    
    if(result)  
      result.isDirectory = 
        function()
          {
          return this.type == 'directory';
          };
        
    return result;
    };
    
client.stat =
  function(path, fn)
    {
    var file = this.findfile(path);
      
    if(fn)
      {
      if(!file)
        {
        fn('Error: ' + file + " not found", undefined);
        return undefined;
        }
        
      fn(undefined, file);
      }
    
    return file;
    };
    
client.readdir = 
  function(path, fn)
    {
    var directory;
    
    if(fn)
      {
      directory = this.findfile(path);
      
      if(!directory)
        {
        fn('Error: ' + directory + " not found", undefined);
        return;
        }
        
      if(directory.isDirectory())
        {
        var objects = new Array();
    
        for(var i in directory.contents)
          objects.push(i);

        fn(undefined, objects);
        }
      }
    };
    
client.read =
  function(path, out)
    {
    client.download(
      {
      container: client.config.tenant,
      remote: path
      }).pipe(out);   
    };
    
client.getFiles(
  client.config.tenant, 
  { limit: 50000 },
  function(err, files) 
    {
    if(!err)
      {
      for(var i in files)
        {
        //console.log(files[i]);
        
        var path = files[i].name;
        
        var parts = path.split('/');
        
        var parent = client.fs;
        
        for(var j in parts)
          {
          var part = parts[j];
          
          if(part)
            {
            if(!parent.contents[part])
              {
              parent.contents[part] = 
                {
                type : 'directory',
                contents : {}
                }
              }
              
            parent = parent.contents[part];
            }
          }
          
        if(parent === client.fs)
          {
          client.fs.contents[path] = {};
          
          parent = client.fs.contents[path];
          }
          
        parent.file = files[i];
        parent.type = 'file';
        }      
        
      console.log("Ready to serve " + files.length + " files");

      app.use(express.static(directory, { maxAge: hourMs }));
      app.use(express.swiftdirectory(client, directory));
      app.use(express.errorHandler());
      }
    else
      console.log(err);
    });

app.listen(8080);
