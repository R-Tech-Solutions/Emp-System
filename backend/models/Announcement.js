class Announcement {
  constructor({
    title,
    content,
    members,
    createdAt = new Date().toISOString(), // Default to the current timestamp
    informByEmail = false, // New property
  }) {
    this.title = title;
    this.content = content;
    this.members = members; // Array of members { name, email, isSelected }
    this.createdAt = new Date(createdAt).toISOString(); // Ensure valid ISO string
    this.informByEmail = informByEmail; // Assign new property
  }

  toFirestore() {
    return {
      title: this.title,
      content: this.content,
      members: this.members,
      createdAt: this.createdAt,
      informByEmail: this.informByEmail, // Include in Firestore data
    };
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Announcement({
      id: snapshot.id,
      title: data.title,
      content: data.content,
      members: data.members,
      createdAt: data.createdAt,
      informByEmail: data.informByEmail, // Map new property
    });
  }
}

module.exports = Announcement;