//
//  Send_records.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 8/7/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import Foundation
import Alamofire

//Funcitons:
//Get records from local database
//Send New_observations and New_harvests local records to farmOS databse using the API


class Send_records {
    
    //These vars will be populated by New_record_controller
    var nameInput = ""
    var bodyInput = ""
    var xcsrf_token = ""

    //Library for parsing received JSON data
    var dataHandlers = Data_handlers()
    
    let logsLoc = "/?q=log"
    //let logsLoc = "/?q=log.json"
    
    let assetsLoc = "/?q=farm_asset"
    //let assetsLoc = "/?q=farm_asset/1.json"
    
    //An X-CSRF token must be obtained from farmOS beore new entities can be posted
    let tokenLoc = "/?q=restws/session/token"


    //Sending records to the farmOS server
    //This is an asynchronous task.  See Check_credentials for more description
    func makeRequest(completionHandler: @escaping (String) -> Void) {

        let baseURL = UserDefaults.standard.string(forKey: "baseURL")

        var farmOS_logs_url = URL(string: "")
        
        if let key = UserDefaults.standard.object(forKey: "baseURL") {
  
            farmOS_logs_url = URL(string: baseURL!+logsLoc)!
        }
        
        var returnString = ""
        
        //Headers for POST request to create a new entity
        //Includes the X-CSRF-Token returned by external function get_token.  This must be executed by new_record_controller before makeRequest
        let requestHeaders = ["X-CSRF-Token": xcsrf_token, "Content-Type": "application/json", "Accept": "application/json"]
        
        //The formatJSON function accepts the inputs I have supplied, and returns a properly formatted request
        let postJSON = formatJSON()

        //Once the JSON is formatted, I will  attach it to the AlamoFire request
        Alamofire.request(farmOS_logs_url!, method: .post, parameters: postJSON, encoding: JSONEncoding.default, headers: requestHeaders).responseString { response in

            //thanks Rob https://stackoverflow.com/questions/27390656/how-to-return-value-from-alamofire
            switch response.result {
            case .success(let value):
                
                print("RETURN VALUE")
                print(value)
                
                //Would like to return a message + new obs ID to New_record_controller for display
                //Unfortunately the farmier server will not return a JSON response to my post request, though beetclock will
                //let idResponse = self.dataHandlers.extractSimpleJSON(rawJSON: value as! [String : AnyObject], key: "id")
                // let requestResponse = "Created an observation with ID "+idResponse
                //completionHandler(requestResponse)
                
                completionHandler("Observation created!")
                
            case .failure(let error):
                
                //This will trigger display of an error message in Main_controller
                completionHandler("invalid credentials")
                print("POST RESPONSE:")
                print(error)
            } // end response switch
            
        }//end alamoFire request
        
        return
        
    }//end func makeRequest
    
    
    func getToken(completionHandler: @escaping (String) -> Void) {
        
        let baseURL = UserDefaults.standard.string(forKey: "baseURL")
        
        var farmOS_token_url = URL(string: "")
        
        if let key = UserDefaults.standard.object(forKey: "baseURL") {

            farmOS_token_url = URL(string: baseURL!+tokenLoc)!
        }
        
        //Headers for POST request to obtain X-CSRF token
        let requestHeaders = ["Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"]
        
        //Make the token request!
        
                Alamofire.request(farmOS_token_url!, method: .post, headers: requestHeaders).responseString { response in
            
            switch response.result {
            case .success(let value):
                
                print("RETURNED TOKEN:")
                print(String (describing: response))
                self.xcsrf_token = String(describing: response)
                
                completionHandler(String(describing: value))
                
            case .failure(let error):
                
                print("NO TOKEN RETURNED")
                print("RESPONSE:")
                print(response)
                completionHandler("invalid credentials")
                
            }
            
        }//end alamofire response
    } // end getToken
    
    
    
    func formatJSON () -> [String: AnyObject] {
        //the farmier server does not allow me to set the timestamp, though beetclock does
        //Getting a current Unix timestamp
        /*
        let currentDate = Date()
        let currentTimestamp = currentDate.timeIntervalSince1970
        //Timestamp is returned as a decimal but farmOS wants an integer, so I am casting it first to an Int and then to a String
        let currentTimeString = String(describing: Int(currentTimestamp))
        print("CURRENT TIMESTAMP:")
        print(currentTimestamp)
        */
        
        //Would like to get the user's id from user settings and constructing a uri
        //Currently, I can't obtain user info at login from the farmier server.  Will have to make a separate request
        //let currentUserId = UserDefaults.standard.string(forKey: "userID")!
        //let baseURL = UserDefaults.standard.string(forKey: "baseURL")!
        //let currentURI = baseURL+"/?q=users/"+currentUserId
        
        let toCompile = [
            "name": nameInput,
            "type": "farm_observation",
            //timestamp disabled for now
            //"timestamp": currentTimeString,
            "field_farm_notes": ["format": "farm_format", "value": bodyInput]
            //"field_farm_log_owner": [["id": currentUserId, "resource": "user", "uri": currentURI]],
            
            //Need to query assets and select from a list in order to construct links
            //"field_farm_asset": [["id": "2", "resource": "farm_asset", "uri": "http://www.beetclock.com/farmOS/?q=farm_asset/2"]]
            ] as! [String: AnyObject]
        
        return toCompile
        
    } // end formatJSON
    
 
    
} //end sendRecords
