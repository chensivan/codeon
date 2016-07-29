module.exports = function(params, tooltip) {
  return `
    <div style="width:37px;height:16px;background: #41BB5A" class="request-button-wrapper">
      <p class="requestbuttonclose" id="__tooltip-${tooltip.myId}">Help</p>
    </div>
  `;
};
