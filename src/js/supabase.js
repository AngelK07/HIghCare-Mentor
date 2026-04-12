// initializing supabase client
const { createClient } = supabase;
// This is secret key so don't leak them dumbass
const supabaseURL = "https://pheuwlzvzvfkfkpwolfj.supabase.co";
const supabasekey= "sb_publishable_6zoRZgubkkIWUD14GFtQew_lymzm_UP";
//now create client
const supabaseClient= createClient(supabaseURL, supabasekey);
//we get the value form website
const count=document.getElementById("Count").value;
const subject=document.getElementById("Subject").value;
async function loadquestions(){
    const{ data, error }= await supabaseClient
    .from("mcq")
    .select("question")
    .eq("Subject", subject)
    .order("random")
    .limit(count);
}