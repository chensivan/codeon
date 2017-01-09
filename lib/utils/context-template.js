module.exports = function(params, tooltip) {
  return `
    <div style="width:180px;height:100px;background: #41BB5A; font-weight:bold" class="request-button-wrapper native-key-bindings">
      <input></input>
      <p class="requestbuttonclose" style='float: right' id="__tooltip-${tooltip.myId}">Send</p>
    </div>
  `;
};
