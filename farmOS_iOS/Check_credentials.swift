//
//  Check_credentials.swift
//  farmOS_iOS
//
//  Created by Alex Smith on 8/7/17.
//  Copyright © 2017 farmOS. All rights reserved.
//

import Foundation
import Alamofire

/*FUNCTIONALITY
// Submit a request for an authentication token to the farmOS server using the url, username and password provided by the user
// If received, Alamofire will hold the token in permanent memory and use it for all subsequent calls to the server
// If a token is received, segue the user to Get_records
// If no token is received, display an error to the user
*/

/*
 https://www.drupal.org/docs/8/core/modules/basic_auth/overview
 
 https://www.drupal.org/node/1860564
 https://www.drupal.org/node/1860564
 https://www.drupal.org/node/2152325
 
 */



class Check_credentials {
    
    //Username and password values will be assigned by credentials controller
    var newBaseURL = ""
    var farmOSusername = ""
    var farmOSpassword = ""
    
    //Library of functions for parsing JSON data
    var dataHandlers = Data_handlers()
    
    let loginLoc = "/?q=user/login"
    
    //Request credentials from the farmOS server
    //Including a completion handler in the function declaration.  This puts makeRequest onto a background thread, returning the completion handler string only once Alamofire returns either a response from the server or an error.
    func makeRequest(completionHandler: @escaping (String) -> Void) {
        
        //First, save the newly entered URL to user settings as 'baseURL'
         UserDefaults.standard.set(newBaseURL, forKey: "baseURL")

          var farmOS_login_url = URL(string: newBaseURL+loginLoc)!

    var returnString = ""
    
    let requestParams = ["form_id": "user_login", "name": farmOSusername, "pass": farmOSpassword]

        //The following successfully logs in to www.beetclock.com/farmOS and livinghopefarm.farmos.net
        //HOWEVER it only retrieves JSON output from beetclock.com NOT farmOS.net!!
        //In beetclock.com/farmOS, retrieves a JSON response including info on the logged-in user (can call responseJSON)
        //In farmOS.net, retrieves a success response paired w/ a 403 error (causing a parsing error if responseJSON is called)
        //It should be possible to retrieve an x-csrf token at the time of login, according to https://groups.drupal.org/node/358308
        Alamofire.request(farmOS_login_url, method: .post, parameters: requestParams, encoding: URLEncoding.default, headers: ["Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"]).responseString { response in
        
            print("LOGIN RESPONSE")
            print(String(describing: response))
                
                print("LOGIN RESPONSE HEADERS:")
                print(response.response?.allHeaderFields)
                
    //The following works fine, but retrieves am http response which I can't use
        //Alamofire.request(farmOS_login_url, method: .post, parameters: requestParams, encoding: URLEncoding.default, headers: ["Content-Type": "application/x-www-form-urlencoded"]).responseString { response in

    //Return either 'success' or 'failure as the completion handler upon receipt of the server's response
    //thanks Rob https://stackoverflow.com/questions/27390656/how-to-return-value-from-alamofire
    switch response.result {
        
    case .success(let value):
        completionHandler("success")

        //Would like to save userName and userID as user settings.  Unfortunately the farmier server does not return .json responses upon login.  beetclock does.
        //let currentUserID = self.dataHandlers.extractSimpleJSON(rawJSON: value as! [String: AnyObject], key: "uid" )
        //let currentUserName = self.dataHandlers.extractSimpleJSON(rawJSON: value as! [String: AnyObject], key: "name" )
        //UserDefaults.standard.set(currentUserID, forKey: "userID")
        //UserDefaults.standard.set(currentUserName, forKey: "userName")

        
    case .failure(let error):
        completionHandler("failure")
        
        print("LOGIN ERROR:")
        print(error)
        
    } //end response switch
 
        }
        
        //end alamoFire request
   
    }//end func makeRequest
    
    
} //end class Check_credentials

    
    
    
    

//THE FOLLOWING ARE OLD ATTEMPTS AT COMMUNICATION W/ THE FARMOS SERVER - FOR REFERENCE ONLY!
    
        //Trying a basic request with AlamoFire

    //Might be a mistake to build this request in Foundation; I'll try with 100% Alamofire
    /*
    var request = URLRequest(url: farmOS_url)
        request.httpMethod = "GET"
        
        Alamofire.request(request)
            .authenticate(user: farmOSusername, password: farmOSpassword)
            .response { (response) -> Void in
                   // print("farmOS response \(response)")
            //.responseJSON { (response) -> Void in
            //    print("JSON response \(response)")
                //completion([String]())
                guard let _: Data? = data, let _: URLResponse? = response, error == nil else {
                    print("*****error")
                    return
                }
                let dataString = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)
                print("*****This is the data returned from farmOS: \(dataString)")
        }
 */
    

    //Making a request entirely in Alamofire:
    
    //I will set the credentials first, and the make a request using Alamofire
    //Adapted from https://stackoverflow.com/questions/35494157/basic-authentication-with-alamofire
    
    //let credentialData = "\(farmOSusername):\(farmOSpassword))".data(using: String.Encoding.utf8)
    //If credentials can be constructed, use
    //if let base64Login = credentialData?.base64EncodedString() {
    
    //let authHeader = ["Authorization": "Basic \(base64Login)"]
        

    
       // Alamofire.manager.request(.GET, stringURL,headers: headers, parameters: params as? [String : AnyObject])
      /*
        Alamofire.request(farmOS_url,
                          method: .get,
                          parameters: nil,
                          encoding: URLEncoding.default,
                          headers: authHeader)
            
            Basic QWxleF9mYXJtT1M6Qipncm93NV5z
            .validate()
            .responseJSON { response in
                if response.result.value != nil{
                    print("***RESPONSE:")
                    print(response)
                    print("***DATA:")
                    print(response.result.value)
                }else{
                    print("***RESPONSE NIL")
                    print(response)
                    
                }
 */

 //  Setting the credentials in AlamoFire doesn't seem to work
 // Alamofire.request(.GET, farmOS_url, parameters: ["operand1": "123"]).responseString { response in
        
        
        
        
        /*
        
        //One more try, using a manually constructed authorization header!!!
        
        Alamofire.request(farmOS_url, method: .get, parameters: nil,encoding: URLEncoding.default, headers: authHeader).responseString { response in
            
            print("Response String: \(response.result.value)")
        }
        
        */
        
        
 
        
 //.authenticate(user: farmOSusername, password: farmOSpassword)
            //, parameters:["Authorization": "Basic QWxleF9mYXJtT1M6Qipncm93NV5z"]

 

 
        //Simpler still!!
        /*
        
        Alamofire.request(farmOS_url, method: .get).authenticate(user: farmOSusername, password: farmOSpassword).responseString { response in
            if response.result.value != nil{
                print("***RESPONSE:")
                print(response)
                print("***DATA:")
                print(response.result.value)
            }else{
                print("***RESPONSE NIL")
                print(response)
                
            }
        }//end response in
 */

        
   // }//end if let base64login
        
                
 

        
        /*
    
    //Including a completion handler in the function declaration.  This references the URLTask
    //func makeRequest(completionHandler:String?) -> Void {
    
      
        //This attempt follows the example at https://developerslogblog.wordpress.com/2017/02/26/basic-authentication-in-swift-3-0/
        //It ALSO fails to work!!!  Generates a 403 error
        
        
        let loginData = String(format: "%@:%@", username, password).data(using: String.Encoding.utf8)!
        let base64LoginData = loginData.base64EncodedString()
        
        // create the request
        var request = URLRequest(url: farmOS_url)
        request.httpMethod = "GET"
        request.setValue("Basic \(base64LoginData)", forHTTPHeaderField: "Authorization")
        
        //making the request
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
          
            guard let _: Data? = data, let _: URLResponse? = response, error == nil else {
                print("*****error")
                return
            }
            let dataString = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)
            print("*****This is the data returned from farmOS: \(dataString)")
            
     
            guard let data = data, error == nil else {
                print("\(error)")
                return
            }
            
            if let httpStatus = response as? HTTPURLResponse {
                // check status code returned by the http server
                print("status code = \(httpStatus.statusCode)")
                // process result
                print(response)
                

            }
 
        }
        task.resume()
        
        */
        
 
        /*
        // create the request
        var request = URLRequest(url: farmOS_url)
        
        // Unsure whether to use a 'get' or 'post' method here...
        //request.httpMethod = "POST"
        request.httpMethod = "GET"
        
        // Now I will build the credentials for basic authentication
        
        let loginString = String(format: "%@:%@", username, password)
        
        print("Login string: ")
        print(loginString)
        
        // Encode the login credentials
        let loginData = loginString.data(using: String.Encoding.utf8)
        
        print("Login data: ")
        print(loginData)
        
        
        //Compiling login credentials into an encoded string.
        //If this completes successfully, attaching the credentials to a session
        //Adding options to encoded credentials
        //if let base64Login = loginData?.base64EncodedString(options: Data.Base64EncodingOptions.init(rawValue: 0)) {
        if let base64Login = loginData?.base64EncodedString() {
            
            //Trying once again to add the Authorization directly to the httpRequest
            request.setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")
            
            print("***Authorization header:")
            print(request.value(forHTTPHeaderField: "Authorization"))
            
            
            
        //I'm attaching the authorization header in session configuration (I orignally attached it to the request itself)
        let config = URLSessionConfiguration.default
             
         /*
            //Try setting credential store to nil, on the off chance a default credential store is overwriting the header
            config.urlCredentialStorage = nil;
            
            
            //Try seting data types in the header to conform to this example: https://stackoverflow.com/questions/24751768/nsurlsessionconfiguration-httpadditionalheaders-not-set
            let headers: [NSObject : AnyObject] = ["Authorization" as NSObject : "Basic \(base64Login)" as AnyObject]
            config.httpAdditionalHeaders = headers
        */

        
        //let base64Login = loginData.base64EncodedString()
            //let base64Login = loginData.base64EncodedString(options: [])
            
            //Previously attempting to add the Authorization directly to the httpRequest
            //request.setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")

        
        //The if/let syntax is supposed to set the login credential only if there is a valid base64 string
        /*
         if let base64Login = loginData?.base64EncodedString(options: []) {
         //let base64Login = loginData.base64EncodedString(options: [])
         
         //Here the Authorization header is actually added to the httpRequest
         //setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")
         request.setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")
         
     //   }// end if let base64login
 */

        //I previously set the header in an HTTPRequest extension
        //request.setAuthorizationHeader()
        
        
        // NSURLConnection is a simple way to make the request
        //   let urlConnection = NSURLConnection(request: request, delegate: self)
        
        //Somehow the authorization header is still being attached as an optional string!  This is preventing the request from going through.
        
        //This creates a listener to receive the response from the server
        


        
        //And now I'm establishing the session
        let farmOS_session = URLSession(configuration: config)
        
        
        //Is it necesssary to set the delegate and operation queue?
        //let farmOS_session = URLSession(configuration: config, delegate: self, delegateQueue: OperationQueue())
        let task = farmOS_session.dataTask(with: request as URLRequest) { (data, response, error) in
            //In this version, I'm not using the URLRequest at all
            //let task = farmOS_session.dataTask(with: farmOS_url) { (data, response, error) in
                guard let _: Data? = data, let _: URLResponse? = response, error == nil else {
                print("*****error")
                return
            }
            let dataString = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)
            print("*****This is the data returned from farmOS: \(dataString)")         }
        task.resume()
        

             }//end if let config
        
  */


    



/* THIS WOULD COME AFTER CLOSING THE CHECK_CREDENTIALS CLASS

extension URLRequest {
    
    mutating func setAuthorizationHeader(){
        
        let username = "Alex_farmOS"
        let password = "B*grow5^s"
        let loginString = String(format: "%@:%@", username, password)

        
        // set up the base64-encoded credentials
        //if let loginData = loginString.data(using: String.Encoding.utf8) {
        let loginData = loginString.data(using: String.Encoding.utf8)
        
        print("Login data: ")
        print(loginData)
        
        //The if/let syntax sets the login credential only if there is a valid base64 string
        //Without this, the header will be assigned an optional string, and will not be read correctly
        
        
        if let base64Login = loginData?.base64EncodedString(options: []) {
        //let base64Login = loginData.base64EncodedString(options: [])
            
        //Here the Authorization header is actually added to the httpRequest
            //setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")
            setValue("Basic \(base64Login)", forHTTPHeaderField: "Authorization")
            
        }// end if let base64login
  //  }//end if let loginData
        
    }//end setAuthHeader
}
 */
