**Proposed Features**

- !channel_set: sets the current channel as claimable (first get the channel ID that the message was sent in and add it to DB)

- !channel_unset: make the channel no longer claimable until set again

- !channel_claim_time <time{hours.minutes.seconds}>: if the current channel is claimable, this will set the amount of time that the channel can be owned by a user

- !claim: user claims channel unless it is already claimed by another user. Running this command again will only extend the timeline if the user enters it within 10 minutes of the expiration date. Otherwise the time until expiration will remain the same.

- !unclaim: user unclaims channel if they are the current owner. Resets channel timer

- !claim_status: lists the time until claim ends, who currently owns the channel, channel name, ID, etc


Copyright (C) 2020 **Thomas Buckley**

>This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License
>as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. 
>                                                   
>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
>without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
>                                                   
>See the GNU General Public License for more details. 
>You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/
