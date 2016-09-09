module.exports = function(params, tooltip) {
  var editor_view = atom.views.getView(atom.workspace).querySelector('.vertical');


  return `
    <div style="width:49px;height:36px;background: #41BB5A; position:absolute; color: white; font-weight:bold" class="request-button-wrapper">
      <p class="requestbuttonclose" id="__tooltip-${tooltip.myId}">Help</p>
    </div>
  `;
};
