namespace EncuentraYA.Domain;

public enum UserRole { User, Administrator }
public enum ReportType { Lost, Found }
public enum ItemStatus { Active, PotentialMatch, ClaimInProgress, Resolved, Closed }
public enum ItemCategory { Phone, Wallet, Backpack, Keys, Documents, Headphones, Electronics, Clothing, Accessories, Other }
public enum ClaimStatus { Pending, Approved, Rejected, Cancelled }
public enum MatchStatus { Suggested, Dismissed, Claimed, Resolved }


