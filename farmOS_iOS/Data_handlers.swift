//
//  Data_handlers.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 12/5/17.
//  Copyright © 2017 farmOS. All rights reserved.
//
//This is a library of functions for parsing various kinds of data returned from farmOS

import Foundation

class Data_handlers {
    
    
    func extractSimpleJSON (rawJSON: [String : AnyObject], key: String) -> String {
        
        var outString = ""
        
        //Post request responses are returned as simple dictionaries
        if let assetId = rawJSON[key] as? String {
            
            outString =  assetId
        } else {
            outString = "Not a simple dictionary"
        }
        
        return(outString)
        
    }  // end extractSimpleJSON
    
    
    func extractComplexJSON (rawJSON: [String : AnyObject], key: String) -> [String] {
        //Parser for dictionaries of arrays of dictionaries
        //These are received when we request all logs or all farm_assets
        
        var outArray = [] as! [String]
        

        //Thanks to tapiwa takaindisa and Larry Mickie for guidance parsing JSON data obtained through AlamoFire
        //https://stackoverflow.com/questions/42422251/could-not-cast-value-of-type-nsdictionaryi-0x16e9900-to-nsarray-0x16e96
        
        if let list = rawJSON["list"] as? [[String: AnyObject]] {
            //if let list = item.value as? [[String: AnyObject]] {
            
            for i in 0 ..< list.count {
                outArray.append(String(describing: list[i][key]!))
            }
            
        } else {
            outArray.append("Not an array of dictionaries")
        }
        
        //Alternative parser for simple dictionaries
        //These are received when we request an individual asset or log
        /* currently disabled
         if let assetName = rawJSON["name"] as? String {
         //if let list = item.value as? [[String: AnyObject]] {
         
         /* var logNames = ""
         for i in 0 ..< list.count {
         logNames = logNames+" "+(String(describing: list[i]["name"]!))
         }*/
         
         outString =  assetName
         } else {
         outString = "Not a simple dictionary"
         }
         */
        
        return(outArray)
        
        
        // return String(describing: rawJSON)
    } // end extractNestedJSON
    
    
    
} //end class Data_handlers
