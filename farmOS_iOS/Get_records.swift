//
//  Get_records.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 8/7/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import Foundation
import Alamofire

/* EVENTUAL FUNCTIONALITY
Retrieve records from REST API in JSON format
Check against records in local database
Write new records (present on farmOS server, not in local DB) to local database
Remove deleted records (not present on farmOS server, present in local DB) from local database
*/

/* CURRENT FUNCTIONALITY
 Retrieve planting records from the farmOS server as a raw, unparsed CSV file
 */



class Get_records {

    
    //I am following the JSON request format at https://www.drupal.org/node/1860564

    let logsLoc = "/?q=log.json"
    
    let assetsLoc = "/?q=farm_asset/1.json"
    //let assetLoc = "/?q=farm_asset.json"
    
    //Library of JSON parsing functions
    var dataHandlers = Data_handlers()
    
    
    //Requesting records from farmOS server
    //This is an asynchronous task.  See Check_credentials for more description
    func makeRequest(completionHandler: @escaping ([String: [String]]) -> Void) {
    
    //Check if this allows baseURL to refresh
    let baseURL = UserDefaults.standard.string(forKey: "baseURL")

    var farmOS_logs_url = URL(string: "")

    if let key = UserDefaults.standard.object(forKey: "baseURL") {
        //Testing out a new plantings location
        //farmOS_logs_url = URL(string: baseURL!+assetsLoc)!
        farmOS_logs_url = URL(string: baseURL!+logsLoc)!
    }
        
        //The change in URL alone does not obtain the desired .json - may need  to include a header
        let requestHeaders = ["Content-Type": "application/json", "Accept": "application/json"]

        var returnString = ""
        

        //Requesting farmOS output
    //inserted parameters: requestHeaders and changed .responseString to .responseJSON in an attempt to obtain JSON output
        Alamofire.request(farmOS_logs_url!, method: .get, headers: requestHeaders).responseJSON { response in
            
            //Return
            //thanks Rob https://stackoverflow.com/questions/27390656/how-to-return-value-from-alamofire
            switch response.result {
            case .success(let value):
                
                print("RETURN VALUE")
                print(value)
                
                //Get names, ids, types and timestamps from the returned json
                let namesReturned = self.dataHandlers.extractComplexJSON(rawJSON: value as! [String: AnyObject], key: "name")
                let idsReturned = self.dataHandlers.extractComplexJSON(rawJSON: value as! [String: AnyObject], key: "id")
                let typesReturned = self.dataHandlers.extractComplexJSON(rawJSON: value as! [String: AnyObject], key: "type")
                let stampsReturned = self.dataHandlers.extractComplexJSON(rawJSON: value as! [String: AnyObject], key: "timestamp")
                
                
                
                
                completionHandler(["Status": ["OK"], "Names": namesReturned, "Ids": idsReturned, "Types": typesReturned, "Timestamps": stampsReturned])
                //completionHandler(self.parseJSON(rawJSON: value as! [String : Any]))
                //completionHandler(self.parseJSON(rawJSON: [String : AnyObject]()))
                
                //completionHandler(String(describing: value))
                
                

            case .failure(let error):

                //This will trigger display of an error message in Main_controller
                completionHandler(["Status": ["Error"]])

            }
            
        }//end alamoFire request

        return
        
    }//end func makeRequest
    
 
    
} //end class Get_records
