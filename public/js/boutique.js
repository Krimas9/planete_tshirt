$(document).on("click", ".bouttonDetailBoutique", function (e) {
  $(".boutiqueDetail").show();
  $(".boutique").hide();

  console.log(1);
});
$(document).on("click", ".retourBoutique", function (e) {
  $(".boutique").show();
  $(".boutiqueDetail").hide();
  console.log(2);
});
