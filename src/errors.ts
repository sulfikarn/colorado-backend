/**
 * Error structure used in this application
 * @return {json} error
 * @param {number} status
 * @param {string} msg
 * @param {string} param
 */
export function formatErr(status:Number, msg:String, param:String) {
  return {
    statusCode: status,
    name: 'Error in '+param,
    message: msg,
  };
}

/**
 * Parse platform error response of bulk upload file verification
 * @param {[json]} msgList
 * @return {json} error
 */
export function formatBulkErr(msgList:[any]) {
  const data = msgList.map((msg : any) => {
    return msg.value+' at row '+msg.rowIdx+' already exists.';
  });
  return {
    count: data.length,
    message: data,
  };
}
