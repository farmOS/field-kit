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
    
    
    //Eventually I would like to retrieve records in JSON format, but I haven't figured out how to get JSON from the restful web services API
    //CSV will work for now; I should be able to parse the returned data without too much trouble
    
    
    let plantingsLoc = "/?q=farm/assets/plantings/csv&attach=page"
    
    
    //Requesting records from farmOS server
    //This is an asynchronous task.  See Check_credentials for more description
   func makeRequest(completionHandler: @escaping (String) -> Void) {
    
    //Check if this allows baseURL to refresh
    let baseURL = UserDefaults.standard.string(forKey: "baseURL")
    
    
    
    var farmOS_csv_url = URL(string: "")

    if let key = UserDefaults.standard.object(forKey: "baseURL") {
   farmOS_csv_url = URL(string: baseURL!+plantingsLoc)!
    }

        var returnString = ""
        

        //Requesting CSV output
        Alamofire.request(farmOS_csv_url!, method: .get).responseString { response in
            
            //Return
            //thanks Rob https://stackoverflow.com/questions/27390656/how-to-return-value-from-alamofire
            switch response.result {
            case .success(let value):

                completionHandler(String(describing: value))

            case .failure(let error):

                //This will trigger display of an error message in Main_controller
                completionHandler("invalid credentials")

            }
            
        }//end alamoFire request

        return
        
    }//end func makeRequest
    
    
} //end class Get_records
