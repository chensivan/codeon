module.exports = function(params, tooltip) {
  return `
    <div style="width:50px;height:74px;background: #FFF" class="tooltip-wrapper">
      <img class="requestbuttonclose" id="__tooltip-${tooltip.myId}" src="http://emojipedia-us.s3.amazonaws.com/cache/91/46/9146faa0eb8e45947d1f98c33519d6a7.png">
      <p style="margin-top:40px">Help</p>
    </div>
  `;
};
