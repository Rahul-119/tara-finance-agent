function normalizeMerchant(merchant: string) {
	const merch = merchant.toLowerCase();

	if (merch.includes("flipkart")) return "flipkart";
	if (merch.includes("swiggy")) return "swiggy";
	if (merch.includes("spotify")) return "spotify";
	if (merch.includes("ola")) return "ola";
	if (merch.includes("netflix")) return "netflix";
	if (merch.includes("dominos")) return "dominos";
	if (merch.includes("youtube")) return "youtube";
	if (merch.includes("apollo")) return "apollo";
	if (merch.includes("uber")) return "uber";
	if (merch.includes("notion")) return "notion";
	if (merch.includes("amazon") || merch.includes("amz")) return "amazon";

	return merch;
}

export default normalizeMerchant;