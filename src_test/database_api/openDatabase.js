import assert from 'assert';
import database from '../../bin/database'; 
import fs from 'fs';
import path from 'path';

const DB_NAME = 'test.db';
const DB_PATH = path.join(__dirname, 'testdir'); 

describe('openDatabase(database_path, database_name)', function(){
    describe('when database file does not exist', function(){
        it('should create new database file');
    });
    describe('when database file exists', function(){
        it('should use existing database file');
    });
    describe('when database_path not specified', function(){
        it('should throw AssertionError', function(){
            assert.throws(()=>{ database.openDatabase(undefined, DB_NAME); }, 
                (err)=>{
                    if((err instanceof assert.AssertionError) && /Database path must be specified!/.test(err)){
                        return true;
                    }
                },
                'did not throw with expected message');
        });
    });
    describe('when database_name not specified', function(){
        it('should throw AssertionError', function(){
            assert.throws(()=>{ database.openDatabase(DB_PATH, undefined); }, 
                (err)=>{
                    if((err instanceof assert.AssertionError) && /Database name must be specified!/.test(err)){
                        return true;
                    }
                }, 
                'did not throw with expected message');            
        });
    });
});
