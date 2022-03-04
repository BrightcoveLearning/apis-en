#!/usr/bin/env ruby
# view id --> content,
#!/usr/bin/env ruby
require 'rest-client'
require 'json'
client_id = '5eb0f20e-29a8-4f19-8cb5-80336e2789ab'
client_secret = 'Zqpb_2YrvnGUEjqQUndx6GsjQ3JyAgXoA2gNbhoj-yUV4scij0jwCN0OBz9FILEwHupjeqwdbOUSFMi7zkhpVg'
response = RestClient.post 'https://oauth.brightcove.com/v4/access_token', :client_id=>client_id,:client_secret=>client_secret,:grant_type=>'client_credentials'
token = JSON.parse(response)["access_token"]
puts "The extracted token is:" + token + "\n\n\n"
data = RestClient.get 'https://data.brightcove.com/analytics-api/videocloud/account/1234567890001/report?dimensions=video&from=2014-01-01&to=2014-03-30', { 'Authorization' => "Bearer #{token}", 'Accept' => 'application/json' }
puts "This is the result from the query: \n" + data
