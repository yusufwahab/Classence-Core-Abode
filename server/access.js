export function accessReason(profile,meeting,signature,revoked,now=Date.now()){
 if(profile.status!=='active')return 'Account is not active';
 if(!signature)return 'NDA required';
 if(meeting.status!=='scheduled')return 'Meeting cancelled';
 if(revoked)return 'Access revoked';
 if(now<new Date(meeting.access_opens_at).getTime())return 'Access window has not opened';
 if(now>new Date(meeting.access_expires_at).getTime())return 'Access window expired';
 return null;
}
export const safeMeeting=({meet_url,...meeting})=>meeting;
